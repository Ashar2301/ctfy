


export const doLogin = async (username, database, handleUpdate) => {
  await database.collection('RTC').doc(username).delete();

  database.collection('RTC').doc(username).onSnapshot(doc=>{
    handleUpdate(doc.data())
  })

  
}



  export const doOffer = async (to, offer, database, username) => {
    await database.collection('RTC').doc(to).set({
        type: 'offer',
        from: username,
        offer: JSON.stringify(offer)
    })
  }

  export const doAnswer = async (to, answer, database, username) => {
    await database.collection('RTC').doc(to).update({
        type: 'answer',
      from: username,
      answer: JSON.stringify(answer)
    })
  }

  export const doLeaveNotif = async (to, database, username) => {
    await database.collection('RTC').doc(to).update({
        type: 'leave',
        from: username
    })
  }
  
  export const doCandidate = async (to, candidate, database, username) => {
    // send the new candiate to the peer
    await database.collection('RTC').doc(to).update({
        type: 'candidate',
      from: username,
      candidate: JSON.stringify(candidate)
    })
  }
  
  
  
  