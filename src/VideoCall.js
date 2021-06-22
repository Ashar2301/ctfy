import React ,{useEffect,useState}from 'react'
import firebase from 'firebase/app';
import 'firebase/firestore';
import {useAuth} from './context/AuthContext'
export default function VideoCall(props) {
    const servers = {
        iceServers: [
          {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
          },
        ],
        iceCandidatePoolSize: 10,
      };
      const [pc,Setpc] = useState();
      const  [firestore , setFirestore]=useState();  
      const {currentUser} = useAuth();
      const [answer , setAnswer] = useState('false');
      let localStream = null;
      let remoteStream = null;

    useEffect(async()=>{
      setAnswer(props.answer);

      console.log(props.answer);
      console.log(props.call);
       const webcamVideo = document.getElementById('localVideo');
       const remoteVideo = document.getElementById('remoteVideo')
       await Setpc(new RTCPeerConnection(servers));
       await setFirestore(firebase.firestore())
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        remoteStream = new MediaStream();
  
    // Push tracks from local stream to peer connection
         localStream.getTracks().forEach((track) => {
            if(pc != undefined){
                pc.addTrack(track, localStream)
            }
       
          });
  
    // Pull tracks from remote stream, add to video stream
    if(pc != undefined)
          {
            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    console.log('happening')
                  remoteStream.addTrack(track);
                });
                  };
          }
  
    webcamVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;
    },[])

    // const answerCall=async()=>{
    //   if(answer === true){
    //     console.log('here')
    //       const callId = props.call.id;
    //       const callDoc = firestore.collection('calls').doc(callId);
    //       const answerCandidates = callDoc.collection('answerCandidates');
    //       const offerCandidates = callDoc.collection('offerCandidates');

    //       pc.onicecandidate = (event) => {
    //           event.candidate && answerCandidates.add(event.candidate.toJSON());
    //       };

    //       const callData = (await callDoc.get()).data();

    //       const offerDescription = callData.offer;
    //       await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    //       const answerDescription = await pc.createAnswer();
    //       await pc.setLocalDescription(answerDescription);

    //       const answer = {
    //           type: answerDescription.type,
    //           sdp: answerDescription.sdp,
    //       };

    //       await callDoc.update({ answer });

    //       offerCandidates.onSnapshot((snapshot) => {
    //           snapshot.docChanges().forEach((change) => {
    //           console.log(change);
    //           if (change.type === 'added') {
    //               let data = change.doc.data();
    //               pc.addIceCandidate(new RTCIceCandidate(data));
    //           }
    //           });
    //       });

    //   }
    //   else{
    //     return(
    //       <div></div>
    //     )
    //   }
    // }
    
   

    const createCall=async()=>{
        const callDoc = firestore.collection('calls').doc();
    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidates = callDoc.collection('answerCandidates');
  
    //callInput.value = callDoc.id;
    
    firestore.collection('incoming').add({
        id:callDoc.id,
        caller:currentUser.email,
        to:props.currentChat[0]
    })
    // Get candidates for caller, save to db
    pc.onicecandidate = (event) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    };
  
    // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
  
    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
  
    await callDoc.set({ offer });
  
    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });
  
    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  
   

    }

    return (
        
        <div class="bg-gray-200  py-2 px-3 rounded shadow-xl text-gray-800 items-center justify-center flex flex-row relative"
         style={{width:"80vw",height:"80vh"}}>
             <div className="w-2/6 flex flex-col items-center justify-center">
                <div className="border-2 border-red-400 w-full" style={{height:'30vh'}}>
                <video className="w-full" autoPlay playsInline id="localVideo" style={{height:'30vh'}}></video>
                </div>
                <button className="m-4 p-2 border-2 border-blue-400" onClick={createCall}>CALL</button>
             </div>
             <div className="w-5/6 flex flex-col items-center justify-center ">
                <div className="border-2 border-blue-400 w-full" style={{height:'70vh'}}>
                <video autoPlay playsInline id="remoteVideo" className="border-2" style={{height:'50vh'}}></video>
                </div>
                
                <button className="m-4 p-2 border-2 border-red-400">END CALL</button>
             </div>
             
        </div>
   
    )
}
