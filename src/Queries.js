import { db } from './firebase-config';
import { 
    collection, 
    query, 
    where,
    updateDoc,
    doc,
    addDoc,
    getDoc,
    getDocs,
} from "firebase/firestore";

export const getEventRef = (eventId) => {
    return doc(db, 'events', eventId);
}

export const getItemRef = (itemId) => {
    return doc(db, 'items', itemId);
}

export const getEventById = async (eventId) => {
    const eventRef = await getDoc(doc(db, 'events', eventId));
    return eventRef.data();
}

export const getItemById = async (itemId) => {
    const itemRef = await getDoc(doc(db, 'items', itemId));
    return itemRef.data();
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
    if (!eventRef) return null;
    return query(
        collection(db, "items"),
        where("event", "==", eventRef)
    );
};

export const itemsWithoutEventQuery = () => {
    return query(
        collection(db, "items"), 
        where("event", "==", null),
    );
}

export const userWithEmailQuery = (email) => {
    return query(
        collection(db, 'users'), 
        where('email', '==', email)
    );
}

export const getUserByEmail = async (email) => {
    const userQuery = query(
        collection(db, 'users'), 
        where('email', '==', email)
    );
    const userQuerySnapshot = await getDocs(userQuery);
    return userQuerySnapshot?.docs[0] ?? null;
}
