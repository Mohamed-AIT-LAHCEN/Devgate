import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const logTimelineAction = async (action) => {
    try {
        await addDoc(collection(db, 'timeline'), {
            ...action,
            createdAt: new Date()
        });
    } catch (error) {
        console.error('Error logging timeline action:', error);
    }
}; 