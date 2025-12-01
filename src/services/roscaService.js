import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore'
import { db } from '../config/firebase'

const ROSCA_COLLECTION = 'rosca'
const MEMBERS_COLLECTION = 'members'
const CALCULATIONS_COLLECTION = 'monthlyCalculations'

// Rosca Group Operations
export const createRoscaGroup = async (groupData) => {
  try {
    const docRef = await addDoc(collection(db, ROSCA_COLLECTION), {
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating rosca group:', error)
    throw error
  }
}

export const getRoscaGroups = async () => {
  try {
    const q = query(collection(db, ROSCA_COLLECTION), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting rosca groups:', error)
    throw error
  }
}

export const updateRoscaGroup = async (groupId, groupData) => {
  try {
    const docRef = doc(db, ROSCA_COLLECTION, groupId)
    await updateDoc(docRef, {
      ...groupData,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating rosca group:', error)
    throw error
  }
}

export const deleteRoscaGroup = async (groupId) => {
  try {
    await deleteDoc(doc(db, ROSCA_COLLECTION, groupId))
  } catch (error) {
    console.error('Error deleting rosca group:', error)
    throw error
  }
}

// Member Operations
export const addMember = async (groupId, memberData) => {
  try {
    const docRef = await addDoc(collection(db, ROSCA_COLLECTION, groupId, MEMBERS_COLLECTION), {
      ...memberData,
      createdAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding member:', error)
    throw error
  }
}

export const getMembers = async (groupId) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, ROSCA_COLLECTION, groupId, MEMBERS_COLLECTION)
    )
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting members:', error)
    throw error
  }
}

export const updateMember = async (groupId, memberId, memberData) => {
  try {
    const docRef = doc(db, ROSCA_COLLECTION, groupId, MEMBERS_COLLECTION, memberId)
    await updateDoc(docRef, memberData)
  } catch (error) {
    console.error('Error updating member:', error)
    throw error
  }
}

export const deleteMember = async (groupId, memberId) => {
  try {
    await deleteDoc(doc(db, ROSCA_COLLECTION, groupId, MEMBERS_COLLECTION, memberId))
  } catch (error) {
    console.error('Error deleting member:', error)
    throw error
  }
}

// Calculation Operations
export const saveMonthlyCalculations = async (groupId, calculations) => {
  try {
    // Delete existing calculations for the group before saving new ones
    const existingCalculations = await getDocs(collection(db, ROSCA_COLLECTION, groupId, CALCULATIONS_COLLECTION));
    const deletePromises = existingCalculations.docs.map(d => deleteDoc(doc(db, ROSCA_COLLECTION, groupId, CALCULATIONS_COLLECTION, d.id)));
    await Promise.all(deletePromises);

    const docRef = await addDoc(
      collection(db, ROSCA_COLLECTION, groupId, CALCULATIONS_COLLECTION),
      {
        calculations,
        createdAt: new Date()
      }
    )
    return docRef.id
  } catch (error) {
    console.error('Error saving calculations:', error)
    throw error
  }
}

export const updateMonthPaymentStatus = async (groupId, monthIndex, paymentStatus) => {
  try {
    // Get the latest calculations document
    const q = query(
      collection(db, ROSCA_COLLECTION, groupId, CALCULATIONS_COLLECTION),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const latestDoc = querySnapshot.docs[0]
      const data = latestDoc.data()
      const calculations = data.calculations || []
      
      // Update the payment status for the specific month
      if (calculations[monthIndex]) {
        calculations[monthIndex].paymentReceived = paymentStatus
        calculations[monthIndex].paymentDate = paymentStatus ? new Date() : null
        
        // Update the document
        await updateDoc(latestDoc.ref, {
          calculations,
          updatedAt: new Date()
        })
      }
    }
  } catch (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
}

export const getMonthlyCalculations = async (groupId) => {
  try {
    const q = query(collection(db, ROSCA_COLLECTION, groupId, CALCULATIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting calculations:', error);
    throw error;
  }
};

