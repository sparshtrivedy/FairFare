import { db } from './firebase-config';
import { 
    collection, 
    query, 
    where,
    getDoc,
    getDocs,
    addDoc,
    doc,
    updateDoc,
} from "firebase/firestore";

export const eventsContainingMemberQuery = (userEmail) => {
    return query(
        collection(db, "events"), 
        where("members", "array-contains", {
            email: userEmail
        })
    );
};

export const itemsWithTransferToMemberQuery = (userEmail) => {
    return query(
        collection(db, "items"), 
        where("transferTo", "==", userEmail)
    );
};

export const itemsInEventQuery = (eventRef) => {
    return query(
        collection(db, "items"), 
        where("event", "==", eventRef)
    );
};

export const userWithEmailQuery = (email) => {
    return query(
        collection(db, 'users'), 
        where('email', '==', email)
    );
}

export const updateMemberSplits = (members, copiedItems, index) => {
    const totalChecked = copiedItems[index].splits.reduce((acc, split) => {
        if (split.isChecked) {
            return acc + 1;
        }
        return acc;
    }, 0);

    for (let j = 0; j < members.length; j++) {
        if (copiedItems[index].splits[j].isChecked) {
            copiedItems[index].splits[j].amount = (copiedItems[index].itemPrice * copiedItems[index].itemQuantity) / totalChecked;
        } else {
            copiedItems[index].splits[j].amount = 0;
        }
    }
}

export const addEvent = async (event) => {
    return await addDoc(collection(db, 'events'), {
        name: event.name,
        date: event.date,
        description: event.description,
        members: event.members,
    });
}

export const addItem = async (item, eventRef) => {
    return await addDoc(collection(db, 'items'), {
        event: eventRef,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemQuantity: item.itemQuantity,
        transferTo: item.transferTo,
        splits: item.splits
    });
}

export const getEventById = async (eventId) => {
    const eventRef = await getDoc(doc(db, 'events', eventId));
    return eventRef.data();
}

export const getItemsByEventId = async (eventId) => {
    const eventRef = await getDoc(doc(db, 'events', eventId));
    const itemsQuery = query(collection(db, 'items'), where('event', '==', eventRef.ref));
    const itemsSnapshot = await getDocs(itemsQuery);
    return itemsSnapshot.docs.map((doc) => {
        return {
            id: doc.id,
            ...doc.data()
        };
    });
}

export const updateEvent = async (eventRef, event) => {
    return await updateDoc(eventRef, {
        name: event.name,
        date: event.date,
        description: event.description,
        members: event.members,
    });
}

export const updateItem = async (itemRef, item) => {
    return await updateDoc(itemRef, {
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemQuantity: item.itemQuantity,
        transferTo: item.transferTo,
        splits: item.splits,
    });
}

export const getEventRef = (eventId) => {
    return doc(db, 'events', eventId);
}

export const getItemRef = (itemId) => {
    return doc(db, 'items', itemId);
}

export const fetchEventsWithMember = async (userEmail, isCalculateSettled) => {
    const memberEventsQuery = eventsContainingMemberQuery(userEmail);
    const memberEventsSnapshot = await getDocs(memberEventsQuery);
    const memberEventsDocs = memberEventsSnapshot.docs;

    const memberEvents = [];

    for (const memberEventDoc of memberEventsDocs) {
        const memberEventRef = memberEventDoc.ref;

        const itemsForMemberEventQuery = itemsInEventQuery(memberEventRef);
        const itemsForMemberEventSnapshot = await getDocs(itemsForMemberEventQuery);

        const itemsData = itemsForMemberEventSnapshot.docs.map((doc) => {
            return doc.data();
        });

        const itemsSplits = itemsData
            .filter(item => item.transferTo !== userEmail)
            .map(item => item.splits);

        const unsettledMembers = itemsData
            .filter(item => item.splits.find(user => user.email === userEmail && user.isChecked && !user.isSettled && item.transferTo !== userEmail))
            .map(item => item.transferTo)
            .join(', ');
        
        const settledMembers = itemsData
            .filter(item => item.splits.find(user => user.email === userEmail && user.isChecked && user.isSettled))
            .map(item => item.transferTo)
            .join(', ');
            
        const total = isCalculateSettled? 
            calculateSettledItemTotal(itemsSplits, userEmail):
            calculateUnsettledItemTotal(itemsSplits, userEmail);

        total && memberEvents.push({
            eventId: memberEventDoc.id,
            eventName: memberEventDoc.data().name,
            eventDate: memberEventDoc.data().date,
            balance: total.toFixed(2),
            unsettledMembers: unsettledMembers,
            settledMembers: settledMembers
        });
    }

    return memberEvents;
}

export const fetchItemsSettledByMember = async (userEmail) => {
    const itemsWithMemberQuery = eventsContainingMemberQuery(userEmail);
    const itemsWithMemberSnapshot = await getDocs(itemsWithMemberQuery);
    const itemsWithMemberDocs = itemsWithMemberSnapshot.docs;

    const settledItems = [];
    itemsWithMemberDocs.forEach(async (doc) => {
        const itemsForEventQuery = itemsInEventQuery(doc.ref);
        const itemsForEventSnapshot = await getDocs(itemsForEventQuery);
        const itemsForEventData = itemsForEventSnapshot.docs.map((doc) => {
            return doc.data();
        });
        itemsForEventData.filter(item => item.splits.find(user => user.email === userEmail && user.isChecked && user.isSettled));
        for (const item of itemsForEventData) {
            const splits = item.splits;
            const numChecked = splits.filter(split => split.isChecked).length;
            for (const split of splits) {
                if (split.email === userEmail && split.isChecked && split.isSettled && item.transferTo !== userEmail) {
                    settledItems.push({
                        id: doc.id,
                        eventId: item.event.id,
                        eventName: doc.data().name,
                        eventDate: doc.data().date,
                        itemName: item.itemName,
                        itemPrice: item.itemPrice,
                        itemQuantity: item.itemQuantity,
                        youPaid: ((item.itemPrice * item.itemQuantity) / numChecked).toFixed(2),
                        transferTo: item.transferTo
                    });
                }
            }
        }
    });
    return settledItems;
}

export const calculateUnsettledItemTotal = (itemSplits, userEmail) => {
    let unsettledItemTotal = 0;

    for (const split of itemSplits) {
        if (split.transferTo !== userEmail) {
            for (const user of split) {
                if (user.email === userEmail && !user.isSettled) {
                    unsettledItemTotal += user.amount;
                }
            }
        }
    }

    return unsettledItemTotal;
}

export const calculateSettledItemTotal = (itemSplits, userEmail) => {
    let settledItemTotal = 0;

    for (const split of itemSplits) {
        if (split.transferTo !== userEmail) {
            for (const user of split) {
                if (user.email === userEmail && user.isSettled) {
                    settledItemTotal += user.amount;
                }
            }
        }
    }

    return settledItemTotal;
}
