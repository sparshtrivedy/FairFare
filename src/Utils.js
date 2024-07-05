import { db } from './firebase-config';
import { 
    collection, 
    query, 
    where,
    getDoc,
    getDocs,
    doc,
} from "firebase/firestore";
import {
    eventsContainingMemberQuery,
    itemsInEventQuery,
    itemsWithoutEventQuery,
    itemsWithTransferToMemberQuery,
} from './Queries';

export const updateMemberSplits = (copiedItems, index) => {
    const totalChecked = copiedItems[index].splits.filter(item => item.isChecked).length;
    const sharedAmount = (copiedItems[index].itemPrice * copiedItems[index].itemQuantity) / totalChecked;

    copiedItems[index].splits.forEach(split => {
        split.amount = split.isChecked ? sharedAmount : 0;
    });
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

export const getItemsYouOwe = async (userEmail, type) => {
    const itemsYouOwe = [];

    const itemsWithMemberQuery = eventsContainingMemberQuery(userEmail);
    const itemsWithMemberSnapshot = await getDocs(itemsWithMemberQuery);
    itemsWithMemberSnapshot.docs
        .forEach(async (event) => {
            const itemsForEventQuery = itemsInEventQuery(event.ref);
            const itemsForEventSnapshot = await getDocs(itemsForEventQuery);
            itemsForEventSnapshot.docs
                .map(item => {
                    return {
                        id: item.id,
                        ...item.data()
                    };
                })
                .filter(item => {
                    return item.splits.find(split => 
                        item.transferTo !== userEmail && split.email === userEmail && split.isChecked && (type === 'settled' ? split.isSettled : !split.isSettled)
                    );
                })
                .forEach(item => {
                    const numChecked = item.splits.filter(item => item.isChecked).length;
                    itemsYouOwe.push({
                        id: item.id,
                        eventId: event.id,
                        eventName: event.data().name,
                        eventDate: event.data().date,
                        itemName: item.itemName,
                        itemPrice: item.itemPrice,
                        itemQuantity: item.itemQuantity,
                        amount: ((item.itemPrice * item.itemQuantity) / numChecked).toFixed(2),
                        splits: item.splits.filter(member => member.isChecked),
                        members: [item.transferTo],
                        transferTo: item.transferTo,
                        createdAt: item.createdAt || null,
                        settledAt: item.splits.filter(split => split.email === userEmail)[0].settledAt || null,
                    });
                });
        });

    const isolatedItemsQuery = itemsWithoutEventQuery();
    const isolatedItemsSnapshot = await getDocs(isolatedItemsQuery);
    isolatedItemsSnapshot.docs
        .map(item => {
            return {
                id: item.id,
                ...item.data()
            };
        })
        .filter(item => {
            return item.splits.find(split =>
                item.transferTo !== userEmail && split.email === userEmail && split.isChecked && (type === 'settled' ? split.isSettled : !split.isSettled)
            );
        })
        .forEach(item => {
            const numChecked = item.splits.filter(split => split.isChecked).length;
            itemsYouOwe.push({
                id: item.id,
                eventId: null,
                eventName: 'N/A',
                eventDate: 'N/A',
                itemName: item.itemName,
                itemPrice: item.itemPrice,
                itemQuantity: item.itemQuantity,
                amount: ((item.itemPrice * item.itemQuantity) / numChecked).toFixed(2),
                splits: item.splits.filter(member => member.isChecked),
                members: [item.transferTo],
                transferTo: item.transferTo,
                createdAt: item.createdAt || null,
                settledAt: item.splits.filter(split => split.email === userEmail)[0].settledAt || null,
            });
        });

    return itemsYouOwe;
}

export const getItemsOwedToYou = async (userEmail, type) => {
    const itemsOwedToYou = [];

    const itemsOwedToMemberQuery = itemsWithTransferToMemberQuery(userEmail);
    const itemsOwedToMemberSnapshot = await getDocs(itemsOwedToMemberQuery);
    const itemsOwedToMemberDocs = itemsOwedToMemberSnapshot.docs;

    for (const doc of itemsOwedToMemberDocs) {
        const itemOwedToMember = doc.data();
        let event = '';

        if (itemOwedToMember.event !== null) {
            const eventRef = await getDoc(itemOwedToMember.event);
            event = eventRef.data();
        }

        const itemSplits = itemOwedToMember.splits.filter(
            split => split.isChecked
        );

        const members = itemSplits
            .filter(member => 
                member.email !== userEmail && (type === 'settled' ? member.isSettled : !member.isSettled)
            )
            .map(member => 
                member.email
            );
        
        const numMembers = itemSplits.length;
        const numSettled = itemSplits.filter(split => split.isSettled && split.email !== userEmail).length;
        const numUnSettled = itemSplits.filter(split => !split.isSettled && split.email !== userEmail).length;
        
        const settledTotal = (parseFloat(itemOwedToMember.itemPrice) * itemOwedToMember.itemQuantity * numSettled) / numMembers;
        const unSettledTotal = (parseFloat(itemOwedToMember.itemPrice) * itemOwedToMember.itemQuantity * numUnSettled) / numMembers;
        const total = type === 'settled' ? settledTotal : unSettledTotal;

        total && itemsOwedToYou.push({
            id: doc.id,
            eventId: itemOwedToMember.event?.id || '',
            eventName: event?.name || 'N/A',
            itemName: itemOwedToMember.itemName,
            itemPrice: itemOwedToMember.itemPrice,
            itemQuantity: itemOwedToMember.itemQuantity,
            amount: total.toFixed(2),
            members: members,
            splits: itemSplits.filter(split => split.isChecked),
            transferTo: itemOwedToMember.transferTo,
            settledAt: numUnSettled === 0 ? itemOwedToMember.lastUpdated : null,
            createdAt: itemOwedToMember.createdAt || null,
        });
    }

    return itemsOwedToYou;
}
