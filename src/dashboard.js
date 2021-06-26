import React , {useState , useEffect} from 'react'
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import { IconContext } from "react-icons";
import {useAuth} from './context/AuthContext'
import {AiFillCamera,AiFillAudio,AiFillPlaySquare,AiFillCloseSquare,AiFillDelete,AiOutlineArrowLeft} from 'react-icons/ai'
import { MdArrowDropDownCircle } from "react-icons/md";
import {HiUserCircle} from 'react-icons/hi'
import { BsFillCameraVideoFill,BsPersonSquare ,BsMusicNoteBeamed,BsFillBackspaceFill} from "react-icons/bs";
import { FiFile } from "react-icons/fi";
import { ImAttachment } from "react-icons/im";
import { IoMdSend } from "react-icons/io";
import MessageTemplate from './messageTemplate';
import ProfileTemplate from './profileTemplate';
import ContactTemplate from './contactTemplate';
import ctfy from './ctfy2.png'
import { useHistory } from 'react-router'

import Classes from './dashboard.module.css'

 export default function Dashboard() {

  const [users,setUser] = useState("")
    const {currentUser , logout} = useAuth();
    const history = useHistory();
   const firestore = firebase.firestore();
    const [search,setSearch] = useState("");
    const [searchResults,setSearchResults] = useState([]);
    const [contactList,setContactList] = useState([]);
    const [tempContactList,setTempContactList] = useState([]);
    const [currentChat ,setCurrentChat] = useState([])
    const [allChats,setAllChats] = useState([]);
    const [currentMessage,setCurrentMessage] = useState("");
    const [selectedFile,setSelectedFile] = useState();
    const [call,setCall] = useState('');
    const [answer ,setAnswer] = useState(false)
    const [type,setType] = useState();
    //const [pageNo , setPageNo] = useState(0);
    let pageNo = 0;
    let localStream=null
    let remoteStream =null

    useEffect(()=>{  
        const onBuild=async()=>{
            await Setpc(new RTCPeerConnection(servers));
            const db = firebase.firestore();
            db.collection('incoming').onSnapshot(snapshot=>{
                snapshot.docChanges().forEach(change=>{
                    if(change.type === 'added'){
                        if(change.doc.data().to === currentUser.email){
                          setCall(change.doc.data());
                          
                        document.getElementById('callOverlay').classList.remove('hidden');
                        document.getElementById('callOverlay').classList.add('flex');
                          
                        
                        }
                    }
                    if(change.type === 'removed'){
                        onEndCall();
                    }
                })
            })


            await db.collection('Users').get().then((querySnapshot)=>{
                querySnapshot.forEach((doc)=>{
                   
                    if(doc.data().email === currentUser.email){
                        setUser(doc.data());
                        db.collection('Users').doc(doc.id).onSnapshot(snapshot=>{
                            setUser(snapshot.data())
                        })
                    }
                })
            })


            await  db.collection(currentUser.email).get().then((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{
               let temp =doc.data().user2;

               //console.log(temp[0])
               db.collection('Users').doc(temp[0]).get().then((doc2)=>{
                   var pfp = doc2.data().pfp;
                   temp.push(pfp);
                 // console.log(temp)
                   setContactList(prevcontactList => [...prevcontactList , temp]);
               })
               

               
                 db.collection(currentUser.email).doc(doc.id).collection('messages').orderBy('time').onSnapshot(snapshot=>{
                    snapshot.docChanges().forEach(change =>{
                       if(change.type === 'added'){
                           //console.log(change.doc.id);
                           setAllChats(prebChats => [...prebChats , {"to" : doc.id , "message":change.doc.data() , "id":change.doc.id}])
                       }
                       else if(change.type === 'modified'){
                       }
                       
                    })
                })
   
            })
        })

        }
        onBuild();
      
    },[])

    useEffect(async()=>{
        if(answer === true && pc!== null && pc!=undefined){
                
                  const callId = call.id;
                  const callDoc = firestore.collection('calls').doc(callId);
                  const answerCandidates = callDoc.collection('answerCandidates');
                  const offerCandidates = callDoc.collection('offerCandidates');
        
                  
                     // console.log('happening')
                    pc.onicecandidate = (event) => {
                        event.candidate && answerCandidates.add(event.candidate.toJSON());
                    };
          
                    const callData = (await callDoc.get()).data();
          
                    const offerDescription = callData.offer;
                    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
          
                    const answerDescription = await pc.createAnswer();
                    await pc.setLocalDescription(answerDescription);
                  
        
                  const answer = {
                      type: answerDescription.type,
                      sdp: answerDescription.sdp,
                  };
        
                  await callDoc.update({ answer });
        console.log('CALLL ANSWEREDDDDD !!!')
                  offerCandidates.onSnapshot((snapshot) => {
                      snapshot.docChanges().forEach((change) => {
                    //  console.log(change);
                      if (change.type === 'added') {
                          let data = change.doc.data();
                          pc.addIceCandidate(new RTCIceCandidate(data));
                      }
                      });
                  });
        
                }
             
    },[answer])

    const onSearchChange=(e)=>{
        setSearchResults([])
        setSearch(e.target.value);
        const db = firebase.firestore();
            
            db.collection("Users").get().then((querySnapshot)=>{
                querySnapshot.forEach((doc)=>{
                    let obj=doc.data();
                    if(obj.email.toLowerCase().indexOf(search.toLowerCase()) !== -1){
                         setSearchResults(prevsearchResults => [...prevsearchResults , obj]);
                    }
                })
            })
    
      }

      const onSearchBarClick=()=>{
        setTempContactList(contactList)
        document.getElementById('contactSearchCloseBtn').classList.toggle('hidden')
      }

    const onContactSearchChange=(e)=>{
        setContactList([])
        let search = e.target.value;
        tempContactList.map((data)=>{
            if(data[1].toLowerCase().indexOf(search.toLowerCase()) !== -1){
                setContactList(prevsearchResults => [...prevsearchResults , data]);
           }
        })

    }

    const showSearchResults=()=>{
        let styles = `rounded-sm items-center cursor-pointer  p-3 w-full flex bg-white mb-2 hover:bg-blue-200 ${Classes.makehover}`;
        if(searchResults.length>0){
           return(
            searchResults.map((data)=>{
                return(
                    <div onClick={()=> {onSearchResultClick(data);toggleModal()}} className={styles}  
                     >
                        <div className="w-1/6">
                                <IconContext.Provider  value={{ color: "#81ecec", size:"6vh" }}>
                                    <div className="cursor-pointer" >
                                    {data.pfp !== undefined ? <img style={{width:'5vh',height:'5vh',borderRadius:'50%'}} src={data.pfp}></img> : <HiUserCircle/>}       
                                    </div>
                                </IconContext.Provider>
                           </div>
                           <div>
                                <h1 className="text-xl font-semibold">{data !== undefined ?  data.email : ""}</h1>
                                <p className="text-base font-thin">{data !== undefined ?  data.name : ""}</p>
                           </div>
                    </div>
                )
            })
           )
        }
    }

    const onSearchResultClick=async(obj)=>{
        showInputBox();
        const db = firebase.firestore();
        let flag = false;
        let dataA=[];
         contactList.map((data)=>{
            if(data[0] === obj.email){
               flag = true; 
               dataA = data;           
            }
           
        })
        if(flag){
           // console.log('upper')
            setCurrentChat(dataA) ; 
        }
        else{
           // console.log(obj.name+ obj.email +users.email)
          await  db.collection(currentUser.email).doc(obj.email).set({
                user1:[currentUser.email , users.name],
                user2:[obj.email,obj.name]
            })

            await  db.collection(obj.email).doc(currentUser.email).set({
                user1:[obj.email,obj.name],
                user2:[currentUser.email , users.name]
            })

            db.collection(currentUser.email).doc(obj.email).collection('messages').orderBy('time').onSnapshot(snapshot=>{
                snapshot.docChanges().forEach(change =>{
                   if(change.type === 'added'){
                    setAllChats(prebChats => [...prebChats , {"to" : obj.email , "message":change.doc.data() , "id":change.doc.id}])
                   }
                   
                })
            })
            var temp = [obj.email,obj.name,obj.pfp]
            setContactList(prevcontactList => [...prevcontactList , temp]);
            setCurrentChat(temp)
          // console.log('lower') 
        }
    }

    const deleteMessage=async(id)=>{
        //console.log(id)
       // console.log(currentChat[0])
        
        await firestore.collection(currentUser.email).doc(currentChat[0]).collection('messages').doc(id).delete().then(()=>{
            //console.log('deleted')
        })

        
        let temp = 0 
        allChats.map((data,index)=>{
            if(data.id === id){
                temp = index;
            }
            
        })
        allChats.splice(temp,1);
        setAllChats(allChats)
    }

    const OnContactClick=()=>{
        const urlList = {
            pdf:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-pdf-64.png?alt=media&token=73893608-a310-47e9-80b5-0cb9e2fcc859',
            word:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-word-48.png?alt=media&token=3222eac6-229d-47a9-ad0e-1f18c951cc45',
            excel:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-microsoft-excel-48.png?alt=media&token=120d4cfe-50cc-412d-980f-edbe2ead646a',
            video:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-video-48.png?alt=media&token=fb60959d-90df-453e-8247-3e4c4eac0540',
            audio:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-audio-file-64.png?alt=media&token=daa2400f-4131-489a-ac5e-346931825f69',
            unknown:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-file-64.png?alt=media&token=65a91d18-b74a-426d-a1fe-51d3f9475f80'
        }
        return(
            allChats.map((data)=>{
                
                if(data.to === currentChat[0]){
                    if(data.message.message === '*FILE*'){
                        let fileUrl = data.message.fileUrl;
                        var filename = fileUrl.replace('https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/','');
                        filename = filename.split('?')[0];
                        var fileExt = filename.split('.')[1];
                        let showURL='';
                        if(fileExt === 'pdf')   showURL = urlList.pdf;
                        else if(fileExt === 'docx') showURL = urlList.word;
                        else if(fileExt === 'xls')  showURL = urlList.excel;
                        else if(fileExt === 'mp3')  showURL = urlList.audio;
                        else if(fileExt === 'mp4' || fileExt === 'avi') showURL = urlList.video;
                        else if(fileExt ==='jpg' || fileExt ==='png' || fileExt ==='gif') showURL = fileUrl
                        else    showURL = urlList.unknown;
                       
                        if(data.message.from===currentUser.email)
                        {
                            return(
                                <div className="rounded-lg w-full"  id={Classes.msgDiv}>
                                {/* //  <div className={Classes.msgDiv}> */}
                                
                                    <span className='rounded-lg  text-xs  hover:text-black' style={{width:'14vh',height:'14vh',color:'#bdc3c7'}}>
                                    
                                    </span>
                                    <span className='float-right cursor-pointer' id={Classes.delSpan} >
                                        <IconContext.Provider  value={{ color: "#81ecec", size:"6vh" }}>
                                        <AiFillDelete/>
                                    </IconContext.Provider>
                                    </span>
                                    <span className=' flex justify-center items-center rounded-lg shadow-sm float-right' style={{backgroundColor:'#bdc3c7',width:'14vh',height:'14vh'}}>
                                            
                                             <a className="shadow-sm" href={data.message.fileUrl} target="_blank"><img src={showURL}  style={{backgroundColor:'#bdc3c7',width:"12vh",height:'12vh'}}></img></a>
                                    </span>
                                  
                                    
                                   
                                 </div>
                            )
                        }
                        else{
                            return(
                                <div className="m-2 my-3 rounded-lg w-full" style={{height:'15vh',maxWidth:'50vw',marginTop:'4vh',marginBottom:'0'}} id={Classes.msgDiv}>
                                    <span className='rounded-lg float-right text-xs  hover:text-black' style={{width:'14vh',height:'14vh',color:'#bdc3c7'}}></span>
                                    <span className='float-left cursor-pointer' id={Classes.delSpan}>
                                        <IconContext.Provider  value={{ color: "#81ecec", size:"6vh" }}>
                                        <AiFillDelete/>
                                    </IconContext.Provider>
                                    </span>
                                    <span className='flex justify-center items-center rounded-lg shadow-sm ' style={{backgroundColor:'white',width:'14vh',height:'14vh'}}>
                                             
                                             <a  href={data.message.fileUrl} target="_blank"><img src={showURL}  style={{backgroundColor:'#bdc3c7',width:"12vh",height:'12vh'}}></img></a>
                                    </span>                                    
                                 </div>
                            )
                        }
                        
                    }
                    else{
                       
                        if(data.message.from === currentUser.email){
                            return(
                                <div className="px-2 my-3 w-full " style={{height:'5vh'}}id={Classes.msgDiv}>
                                    <span className=" rounded-lg  text-xs  hover:text-black" style={{color:'#bdc3c7'}}><h1 ></h1></span>
                                    <span className='float-right cursor-pointer' id={Classes.delSpan} onClick={()=>deleteMessage(data.id)} >
                                        <IconContext.Provider  value={{ color: "#81ecec", size:"4vh" }}>
                                        <AiFillDelete/>
                                    </IconContext.Provider>
                                    </span>
                                    <span className="p-2 rounded-lg float-right text-lg " style={{backgroundColor:'#bdc3c7'}}>
                                    {data.message.message}</span>
                                    
                                </div>
                            )
                        }
                        else{
                            return(
                                <div className="m-2 my-3 w-full " style={{height:'5vh'}}id={Classes.msgDiv}>
                                     <span className=" rounded-lg text-xs float-right hover:text-black" style={{color:'#bdc3c7'}}></span>
                                     <span className='float-left cursor-pointer' id={Classes.delSpan}>
                                        <IconContext.Provider  value={{ color: "#81ecec", size:"4vh" }}>
                                        <AiFillDelete/>
                                    </IconContext.Provider>
                                    </span>
                                    <span className="p-2 rounded-lg text-lg" style={{backgroundColor:'white'}}>
                                    {data.message.message}</span>
                                    
                                </div>
                            )
                        }
                        
                    }
                }
            })
        )
    }

    const hideElements=()=>{
       // console.log('hide' + pageNo)
        let width = window.screen.width
        if(width <= 768){
            if(pageNo == 1){
                document.getElementsByClassName('contacts')[0].style.display = 'none';
                document.getElementsByClassName('profile')[0].style.display = 'none';
                document.getElementsByClassName('messages')[0].style.display = 'block';
            }
            else if(pageNo == 2){
                document.getElementsByClassName('contacts')[0].style.display = 'none';
                document.getElementsByClassName('profile')[0].style.display = 'flex';
                document.getElementsByClassName('messages')[0].style.display = 'none';
            }
            else if(pageNo == 0){
                document.getElementsByClassName('contacts')[0].style.display = 'flex';
                document.getElementsByClassName('profile')[0].style.display = 'none';
                document.getElementsByClassName('messages')[0].style.display = 'none';
            }
        }
    }
    const onBackClick=()=>{
      //  console.log(pageNo)
        if(pageNo == 2){
           // setPageNo(1);
           pageNo = 1;
            hideElements();
        }
        else if(pageNo == 1){
           // setPageNo(0);
            pageNo = 0;
            hideElements();
        }
        else if(pageNo == 0){
           // setPageNo(0);
            pageNo = 0;
            hideElements();
        }
    }
    const showContactList=()=>{
    
        if(contactList.length>0){
           // console.log(contactList)
            
            return(
                contactList.map((data)=>{
                   
               
                    return(
                        <div onClick={()=>{ setCurrentChat(data);showInputBox();pageNo=1;hideElements()}}  className="border-2 rounded-sm items-center cursor-pointer  p-3 w-full flex bg-white hover:bg-gray-100 relative" style={{marginLeft:"auto" , marginRight:"auto",height:'8vh',}}>
                           <div className="w-1/6">
                                <IconContext.Provider  value={{ color: "#81ecec", size:"5vh" }}>
                                    <div className="cursor-pointer" >
                                    {data[2] !== "" ? <img style={{width:'4vh',height:'4vh',borderRadius:'50%'}} src={data[2]}></img> : <HiUserCircle/>}       
                                    </div>
                                </IconContext.Provider>
                           </div>
                           <div>
                                <h1 className="text-xl font-semibold">{data !== undefined ?  data[1] : ""}</h1>
                                <p className="text-base font-thin">{data !== undefined ?  data[0] : ""}</p>
                           </div>
                           <div className='right-0 absolute hover:bg-gray-200 rounded-lg' onClick={()=>deleteAllChat(data[0])} id={data[0]} >
                                 <IconContext.Provider  value={{ color: "#81ecec", size:"3vh" }}>
                                   <AiFillDelete/>
                                </IconContext.Provider>
                           </div>
                        </div>
                    )
                })
            )
        }
    }

    const deleteAllChat=async(id)=>{
        await firestore.collection(currentUser.email).doc(id).delete().then(()=>{
           // console.log('DELETED')
        })
        let del =0;
        contactList.map((data,index)=>{
            if(data[0] === id){
                del = index;
            }
        })
        contactList.splice(del,1)
        setContactList(contactList)
        setCurrentChat(contactList[0])
    }

    const showInputBox=()=>{
        const div = document.getElementById('messageBox')
        div.classList.add('flex')
        div.classList.remove('hidden')
    }
   
    const toggleModal=()=>{
        const overlay = document.querySelector('#overlay')
           
            
            overlay.classList.toggle('hidden')
                overlay.classList.toggle('flex')
    }
    
    const onMessageChange=(e)=>{
        setCurrentMessage(e.target.value)
        
    }
    const onSend = async()=>{
       // console.log('here')
        const db =firebase.firestore();
        const time = new Date();
        await db.collection(currentUser.email).doc(currentChat[0]).collection('messages').add({
            to:currentChat[0],
            from:currentUser.email,
            message : currentMessage,
            time:time
        })

        await db.collection(currentChat[0]).doc(currentUser.email).collection('messages').add({
            to:currentChat[0],
            from:currentUser.email,
            message : currentMessage,
            time:time
        })

        let obj = document.getElementById('input');
        obj.value = "";
    }

    const onSendFile=()=>{
        let file = document.getElementById('sendFile')
        let btn = document.getElementById('sendFileButton')
        file.click();
        
    }

    const onSelectFileChange=(event)=>{
        setSelectedFile(event.target.files[0]);
       // console.log(event.target.files[0])
        let obj = document.getElementById('overlay2')
        obj.classList.toggle('flex')
        obj.classList.toggle('hidden')
    }

    const showFileDetails=()=>{
       if(selectedFile != null){
        return(
            <div>
                <h1 className='text-lg font-medium mb-2'>NAME : {selectedFile.name}</h1>
                <h1 className='text-lg font-medium mb-2'>TYPE : {selectedFile.type.split('/')[1]}</h1>
                <h1 className='text-lg font-medium mb-2'>SIZE : {Math.round(parseInt(selectedFile.size)/1024)} KB</h1>
            </div>
        )
       }
       else{
           return(
               <div>NO FILE SELECTED</div>
           )
       }
    }

    const showFileThumbnail=()=>{
        const urlList = {
            pdf:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-pdf-64.png?alt=media&token=73893608-a310-47e9-80b5-0cb9e2fcc859',
            word:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-word-48.png?alt=media&token=3222eac6-229d-47a9-ad0e-1f18c951cc45',
            excel:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-microsoft-excel-48.png?alt=media&token=120d4cfe-50cc-412d-980f-edbe2ead646a',
            video:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-video-48.png?alt=media&token=fb60959d-90df-453e-8247-3e4c4eac0540',
            audio:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-audio-file-64.png?alt=media&token=daa2400f-4131-489a-ac5e-346931825f69',
            unknown:'https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/icons8-file-64.png?alt=media&token=65a91d18-b74a-426d-a1fe-51d3f9475f80'
        }
        if(selectedFile != null){
            let fileExt = selectedFile.name.split('.');
            fileExt = fileExt[fileExt.length-1];
            let showURL='';
                        if(fileExt === 'pdf')   showURL = urlList.pdf;
                        else if(fileExt === 'docx') showURL = urlList.word;
                        else if(fileExt === 'xls')  showURL = urlList.excel;
                        else if(fileExt === 'mp3' || fileExt === 'mpeg')  showURL = urlList.audio;
                        else if(fileExt === 'mp4' || fileExt === 'avi') showURL = urlList.video;
                        else if(fileExt ==='jpg' || fileExt ==='png' || fileExt ==='gif') showURL = URL.createObjectURL(selectedFile)
                        else    showURL = urlList.unknown;
            return(
              
                    
                    <div className="cursor-pointer" id="sendFileButton" onClick={onSendFile} style={{marginTop:'auto' , marginBottom:'auto'}}>
                    <img src={showURL} style={{widths:'20vh',height:'20vh'}}></img>
                                 
                    </div>
                    
               
            )
           }
           else{
               return(
                   <div>NO FILE SELECTED</div>
               )
           }
    }

    const minimizeFileModal=()=>{
        let obj = document.getElementById('overlay2')
        obj.classList.toggle('flex')
        obj.classList.toggle('hidden')
        setSelectedFile();
    }

    const onSendFileClick=async()=>{
        const file = selectedFile;
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(file.name);
        await fileRef.put(file);
        const date = new Date();
        // setFileUrl(await fileRef.getDownloadURL());
        // console.log(await fileRef.getDownloadURL())
        const db = firebase.firestore();
        await db.collection(currentUser.email).doc(currentChat[0]).collection('messages').add({
            to:currentChat[0],
            from:currentUser.email,
            message : '*FILE*',
            fileUrl : await fileRef.getDownloadURL(),
            time:date
        })

        await db.collection(currentChat[0]).doc(currentUser.email).collection('messages').add({
            to:currentChat[0],
            from:currentUser.email,
            message : '*FILE*',
            fileUrl : await fileRef.getDownloadURL(),
            time:date
        })
        let obj = document.getElementById('overlay2')
        obj.classList.toggle('flex')
        obj.classList.toggle('hidden')

    }

    const onLogOutClick=async()=>{
      await  logout();
      history.push('/');
      window.location.reload();
    }
   
    const profile=()=>{
        
        return(
      <div className="flex flex-col" style={{marginTop:"1vh"}}>
             <div className="ml-auto mr-auto relative" style={{marginBottom:"3vh"}}>
                <IconContext.Provider  value={{ color: "#7ed6df", size:"30vh" }}>
                     <div className="cursor-pointer" >
                     {currentChat[2] !== "" ? <img style={{width:'28vh',height:'30vh',borderRadius:'0%'}} src={currentChat[2]}></img> : <BsPersonSquare/>}       
                     </div>
                  </IconContext.Provider>
                  
            </div>
            <div className="text-5xl font-normal ml-7" style={{marginBottom:"3vh"}}>
                {currentChat[1]}
            </div>
            <div className="text-xl font-thin ml-7" style={{marginBottom:"3vh"}}>
                {currentChat[0]}
            </div>
        </div>
        )

    }
    const changePFP=()=>{
        let obj = document.getElementById('choosePFP');
        obj.click();

    }
    const getFileNameFromURL=(url)=>{
        var res1 = url.split('https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/');
        var res2 = res1[1].split('?')
        res2[0] = res2[0].replaceAll('%20' , ' ');
        return res2[0];

    }
    const onPFPChange=async(event)=>{
        //setSelectedFile(event.target.files[0]);
        const file = event.target.files[0];
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(file.name);
        await fileRef.put(file);
        const url = await fileRef.getDownloadURL()
        // setFileUrl(await fileRef.getDownloadURL());
        // console.log(await fileRef.getDownloadURL())
        const db = firebase.firestore();
        await db.collection("Users").get().then((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{
                let obj=doc.data();
                if(obj.email === currentUser.email){

                    if(obj.pfp !== undefined){
                        var fileName = getFileNameFromURL(obj.pfp);
                       // console.log(fileName)
                        storageRef.child(fileName).delete().then(()=>{
                           // console.log('deleted')
                        })
                    }
                     db.collection("Users").doc(doc.id).update({
                        pfp:url
                    })
                }
            })
        })
    }

    const chatHead=()=>{
        return(
            <div className="flex" onClick={()=>{pageNo=2;hideElements()}}>
                <h1 className="w-5/6 text-2xl m-2 font-medium">{currentChat[1]}</h1>
 
                    <span className="rounded-lg p-2 px-2 mx-2 my-auto" onClick={videoCallClick}  style={{backgroundColor:'#eafdfe',height:'5vh',marginTop:'.5vh'}}>
                        <IconContext.Provider  value={{ color: "#7ed6df", size:"3vh" }}>
                            <BsFillCameraVideoFill/>
                        </IconContext.Provider>
                    </span>
                    <span className="rounded-lg p-2 mx-2 my-auto" onClick={audioCallClick} style={{backgroundColor:'#eafdfe',height:'5vh',marginTop:'.5vh'}}>
                        <IconContext.Provider  value={{ color: "#7ed6df", size:"3vh" }}>
                            <AiFillAudio/>
                        </IconContext.Provider>
                    </span>
            </div>
        )
    }


    const showMedia=()=>{
        let itr = 0;
        return(
            allChats.map((data)=>{
                
                if(data.to === currentChat[0]){
                    if(data.message.message === '*FILE*'){
                        let fileUrl = data.message.fileUrl;
                        
                        
                        var filename = fileUrl.replace('https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/','');
                        //console.log(filename)
                        filename = filename.split('?')[0];
                       // console.log(filename)
                        var fileExt = filename.split('.')[1];
                        //console.log(filename + fileExt)
                        if(fileExt === 'png' ||fileExt === 'jpg' ||fileExt === 'gif' ){
                            if(itr<=1){
                                itr++;
                                return(
                                    <div style={{backgroundColor:'#ecf0f1'}}>
                                        <a href={data.message.fileUrl} target="_blank"><img style={{width:'7vw',height:'7vw'}} src={data.message.fileUrl}></img></a>
                                    </div>
                                )
                            }
                            else if(itr == 2){
                                console.log('here')
                                itr++;
                                return(
                                    <div style={{width:'7vw',height:'7vw',backgroundColor:'#ecf0f1'}} className="flex justify-center items-center relative">
                                       <div onClick={toggleMedia} className="text-center font-bold z-20 cursor-pointer" > Show More</div>
                                       <img className='opacity-30 absolute ' style={{width:'7vw',height:'7vw'}} src={data.message.fileUrl}></img>
                                    </div>
                                )
        
                            }
                        }
                        else if(fileExt === 'mp4' ||fileExt === 'avi'){
                            if(itr<=1){
                                itr++;
                                return(
                                    <div style={{backgroundColor:'#ecf0f1'}}>
                                        <a href={data.message.fileUrl} target="_blank">
                                        <IconContext.Provider  value={{ color: "#81ecec", size:"full" }}>
                                        <AiFillPlaySquare/>         
                                         </IconContext.Provider>
                                        </a>
                                    </div>
                                )
                            }
                        }
                        else if(fileExt === 'mp3'){
                            if(itr<=1){
                                itr++;
                                return(
                                    <div>
                                        <a href={data.message.fileUrl} target="_blank">
                                        <IconContext.Provider  value={{ color: "#81ecec", size:"full" }}>
                                        <BsMusicNoteBeamed/>         
                                         </IconContext.Provider>
                                        </a>
                                    </div>
                                )
                            }
                        }
                        
                        
                    }
                    
                   
                }
            })
        )
    
    }

    const toggleMedia=()=>{
        document.getElementById('mediaElement').classList.toggle('flex');
        document.getElementById('mediaElement').classList.toggle('hidden');
        
    }
    const toggleFiles=()=>{
        document.getElementById('fileElement').classList.toggle('flex');
        document.getElementById('fileElement').classList.toggle('hidden');
        
    }

    const showAllMedia=()=>{
       
        return(
            allChats.map((data)=>{
                
                if(data.to === currentChat[0]){
                    if(data.message.message === '*FILE*'){
                        let fileUrl = data.message.fileUrl;
                        var filename = fileUrl.replace('https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/','');
                        //console.log(filename)
                        filename = filename.split('?')[0];
                       // console.log(filename)
                        var fileExt = filename.split('.')[1];
                       // console.log(filename + fileExt)
                        if(fileExt === 'png' ||fileExt === 'jpg' ||fileExt === 'gif' ){
                            return(
                                    <div style={{backgroundColor:'#ecf0f1'}}>
                                        <a href={data.message.fileUrl} target="_blank"><img style={{width:'7vw',height:'7vw'}} src={data.message.fileUrl}></img></a>
                                    </div>
                                )
                              }
                        else if(fileExt === 'mp4' ||fileExt === 'avi'){
                             return(
                                    <div style={{backgroundColor:'#ecf0f1'}}>
                                        <a href={data.message.fileUrl} target="_blank">
                                        <IconContext.Provider  value={{ color: "#81ecec", size:"full" }}>
                                        <AiFillPlaySquare/>         
                                         </IconContext.Provider>
                                        </a>
                                    </div>
                                )
                              }
                        else if(fileExt === 'mp3'){
                             return(
                                    <div>
                                        <a href={data.message.fileUrl} target="_blank">
                                        <IconContext.Provider  value={{ color: "#81ecec", size:"full" }}>
                                        <BsMusicNoteBeamed/>         
                                         </IconContext.Provider>
                                        </a>
                                    </div>
                                )
                            }
                         }
                        }
            })
        )
    }

    const showFiles=()=>{
        let itr = 0;
        return(
            allChats.map((data)=>{
                
                if(data.to === currentChat[0]){
                    if(data.message.message === '*FILE*'){
                        let fileUrl = data.message.fileUrl;
                        
                        
                        var filename = fileUrl.replace('https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/','');
                        //console.log(filename)
                        filename = filename.split('?')[0];
                       // console.log(filename)
                        var fileExt = filename.split('.')[1];
                        let filenameReal = filename.replaceAll('%20',' ')
                        //console.log(filename + fileExt)
                        if(fileExt !== 'png' && fileExt !== 'jpg' && fileExt !== 'gif'&&fileExt !== 'mp4'&&fileExt !== 'avi'&&fileExt !== 'mp3' ){
                            if(itr<=1){
                                itr++;
                                return(
                                    <div  className="flex flex-row">
                                        <a href={data.message.fileUrl} target="_blank">
                                         <IconContext.Provider  value={{ color: "#81ecec", size:"4vw" }}>
                                         <FiFile/>     
                                         </IconContext.Provider>
                                        </a>
                                        <div className='mt-auto mb-auto'>{filenameReal}</div>
                                    </div>
                                )
                            }
                                                        
                        }
                       }
                    }
            })
        )
    }

    const showAllFiles=()=>{
        return(
            allChats.map((data)=>{
                if(data.to === currentChat[0]){
                    if(data.message.message === '*FILE*'){
                        let fileUrl = data.message.fileUrl;
                        var filename = fileUrl.replace('https://firebasestorage.googleapis.com/v0/b/sma-project-dc315.appspot.com/o/','');
                         filename = filename.split('?')[0];
                        var fileExt = filename.split('.')[1];
                        let filenameReal = filename.replaceAll('%20',' ')
                        
                        if(fileExt !== 'png' && fileExt !== 'jpg' && fileExt !== 'gif'&&fileExt !== 'mp4'&&fileExt !== 'avi'&&fileExt !== 'mp3' ){
                            
                                return(
                                    <div  className="flex flex-row p-2">
                                        <a href={data.message.fileUrl} target="_blank">
                                         <IconContext.Provider  value={{ color: "#81ecec", size:"4vw" }}>
                                         <FiFile/>     
                                         </IconContext.Provider>
                                        </a>
                                        <div className='mt-auto mb-auto'>{filenameReal}</div>
                                    </div>
                                )
                              }
                            }
                        }
            })
        )
    }

    //WEBRTC STUFF

    const servers = {
        iceServers: [
          {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
          },
        ],
        iceCandidatePoolSize: 10,
      };
      const [pc,Setpc] = useState();

      const videoCallClick=async()=>{
        document.getElementById('overlay3').classList.add('flex');
        document.getElementById('overlay3').classList.remove('hidden');       
        setType('video')
                const webcamVideo = document.getElementById('localVideo');
                const remoteVideo = document.getElementById('remoteVideo')
                
               
               localStream= await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                remoteStream = new MediaStream()
          
                localStream.getTracks().forEach((track) => {
                    if(pc != undefined){
                        pc.addTrack(track, localStream)
                    }
                
                    });
            
            if(pc != undefined)
                    {
                    pc.ontrack = (event) => {
                        event.streams[0].getTracks().forEach((track) => {
                            //console.log('happening')
                            remoteStream.addTrack(track);
                        });
                            };
                    }
            
            webcamVideo.srcObject = localStream;
            remoteVideo.srcObject = remoteStream;
    }

    const audioCallClick=async()=>{
        document.getElementById('voiceCallOverlay').classList.add('flex');
        document.getElementById('voiceCallOverlay').classList.remove('hidden');       
        setType('audio')
                const localAudio = document.getElementById('localAudio');
                const remoteAudio = document.getElementById('remoteAudio')
                
               
               localStream= await navigator.mediaDevices.getUserMedia({  audio: true })
                remoteStream = new MediaStream()
          
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
                            
                            remoteStream.addTrack(track);
                        });
                            };
                    }
            
            localAudio.srcObject = localStream;
            remoteAudio.srcObject = remoteStream;
    }

      
      const createCall=async()=>{
                const callDoc = firestore.collection('calls').doc();
            const offerCandidates = callDoc.collection('offerCandidates');
            const answerCandidates = callDoc.collection('answerCandidates');

            document.getElementById('videoCallBtn').classList.add('hidden')
            document.getElementById('voiceCallBtn').classList.add('hidden')
        
           
           //if(pc!==null)
           {
                
            firestore.collection('incoming').add({
                id:callDoc.id,
                caller:currentUser.email,
                to:currentChat[0],
                type:type
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
            if (!pc.currentRemoteDescription && data.answer) {
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
    }

    const onAcceptCall=()=>{
        document.getElementById('callOverlay').classList.remove('flex');
        document.getElementById('callOverlay').classList.add('hidden');
        document.getElementById('videoCallBtn').classList.add('hidden')
        document.getElementById('voiceCallBtn').classList.add('hidden')

        if(call.type === 'video'){
            document.getElementById('overlay3').classList.add('flex');
            document.getElementById('overlay3').classList.remove('hidden');
            setAnswer(true);
            videoCallClick();
        }
        else if (call.type ==='audio'){
            document.getElementById('voiceCallOverlay').classList.remove('hidden');
            document.getElementById('voiceCallOverlay').classList.remove('flex');
            setAnswer(true);
            audioCallClick();
        }
        
        
    }

    const onDeclineCall=async()=>{

        document.getElementById('callOverlay').classList.toggle('hidden')
        document.getElementById('callOverlay').classList.toggle('flex')

        await  firestore.collection('incoming').get().then((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{
              firestore.collection('incoming').doc(doc.id).delete();   
            })
        })

        await  firestore.collection('calls').get().then((querySnapshot2)=>{
            querySnapshot2.forEach((doc2)=>{
              firestore.collection('calls').doc(doc2.id).delete();   
            })
        })

    }

    const onEndCall=async()=>{
       Setpc(null);setAnswer(false);
       
       document.getElementById('videoCallBtn').classList.remove('hidden');
       document.getElementById('voiceCallBtn').classList.remove('hidden');
       document.getElementById('overlay3').classList.remove('flex');
        document.getElementById('overlay3').classList.add('hidden');
        document.getElementById('voiceCallOverlay').classList.remove('flex');
        document.getElementById('voiceCallOverlay').classList.add('hidden');
        document.getElementById('videoCallBtn').classList.remove('hidden')
        document.getElementById('voiceCallBtn').classList.remove('hidden')
        document.getElementById('videoCallBtn').classList.add('flex')
        document.getElementById('voiceCallBtn').classList.add('flex')
        window.location.reload();
        
    const webcamVideo = document.getElementById('localVideo');
    if(webcamVideo.srcObject !== null){
        webcamVideo.srcObject.getTracks().forEach((track)=>{
            track.stop();
        })
    }

    const localAudio = document.getElementById('localAudio');
    if(localAudio.srcObject !== null){
        localAudio.srcObject.getTracks().forEach((track)=>{
            track.stop();
        })
    }
        await  firestore.collection('incoming').get().then((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{
              firestore.collection('incoming').doc(doc.id).delete();   
            })
        })

        await  firestore.collection('calls').get().then((querySnapshot)=>{
            querySnapshot.forEach((doc2)=>{
              firestore.collection('calls').doc(doc2.id).delete();   
            })
        })
       
    }

    const onDropdownClick=()=>{
        document.getElementById('dropdown').classList.toggle('flex');

        document.getElementById('dropdown').classList.toggle('hidden')
 }

    return (
       <div id="blur" className="w-full">
            <div className="relative">
            <div className=" flex justify-between" style={{height:"10vh",borderBottom:'1px solid #bdc3c7',backgroundColor:'#93dbe9'}}>
                <button onClick={onBackClick} id={Classes.backBtn} className="hidden">
                    <IconContext.Provider  value={{ color: "#2980b9", size:"5vh" }}>
                                                <AiOutlineArrowLeft/>         
                    </IconContext.Provider>
                </button>
                <img src={ctfy} id={Classes.navbarLogo} className="relative " style={{width:'7vw',height:'7vh',margin:'1vw',padding:'0'}}></img>
                <input id={Classes.searchBarNav} onClick={toggleModal} className="p-8 rounded-3xl outline-none" style={{backgroundColor:'#ecf0f1'}} placeholder="SEARCH"></input>
                <div className="flex p-6  justify-center relative items-center" style={{width:'20vw'}}>
                    <div className='absolute' style={{borderLeft:"0.5px solid #ecf0f1" , height:'7vh',left:'-1vh'}}></div>
                    <div className="absolute left-0 " style={{top:'16%'}}>
                        {users.pfp === "" ?
                        <IconContext.Provider  value={{ color: "#81ecec", size:"7vh" }}>
                                    <HiUserCircle/>         
                        </IconContext.Provider> :
                       <img className='mt-auto mb-auto' style={{width:'6vh',height:'6vh',borderRadius:'50%',paddingRight:'5px'}} src={users.pfp}></img>
                        
                        }
                    </div>
                    <div className="flex flex-col relative " id={Classes.navbarName} style={{width:'10vw'}}>
                        <div className=" p-1 font-normal text-2xl w-full overflow-hidden">{users !== ""? users.name.substring(0,10) : ""}</div>
                        <div>
                            <h1 className="ml-5"><span  style={{borderRadius:'50%',height:'3vh',width:'4vh',backgroundColor:'green',color:'green'}}>oo</span>{users !== undefined? 'Online' : ""}</h1>
                        </div>
                    </div>
                    <div onClick={onDropdownClick} className="absolute right-4" style={{top:'25%'}}>
                        <IconContext.Provider  value={{ color: "#2980b9", size:"3vh" }}>
                                    <MdArrowDropDownCircle/>         
                        </IconContext.Provider>
                    </div>
                    <div id="dropdown" className={[Classes.navbarDropdown , 'absolute bg-white hidden flex-col items-center justify-center z-50 rounded-lg'].join(' ')} >
                        <div className="relative" >
                            {users.pfp === "" ?
                            <IconContext.Provider  value={{ color: "#81ecec", size:"16vh" }}>
                                        <HiUserCircle/>         
                            </IconContext.Provider> :
                        <img style={{width:'16vh',height:'16vh',borderRadius:'50%',paddingRight:'5px'}} src={users.pfp}></img>
                            
                            }
                            <div className="absolute border-2 bottom-0 right-0 bg-white border-gray-200 cursor-pointer" style={{borderRadius:'50%'}} onClick={changePFP}>
                                <IconContext.Provider  value={{ color: "#81ecec", size:"5vh" }}>
                                            <AiFillCamera/>         
                                </IconContext.Provider>
                            </div>
                            <input type='file' className="hidden" id="choosePFP" onChange={onPFPChange}></input>
                        </div>
                        <h1 className="text-lg font-semibold py-2">{users.name}</h1>
                        <h2 className="text-base font-medium py-2">{currentUser.email}</h2>
                        <button onClick={onLogOutClick} className="border-2 rounded-sm border-red-400 p-2 my-2">LOG OUT</button>
                    </div>
                </div>
            </div>
            
        </div>

        <div class="bg-black bg-opacity-50 absolute inset-0 hidden justify-center items-center z-50" id="overlay">
        <div id={Classes.searchOverlay} class="border-10 border-red-400 bg-gray-200  py-2 px-3 rounded shadow-xl text-gray-800 overflow-auto"  >
            <div class="flex justify-between items-center">
                <input onChange={onSearchChange} className="p-6 rounded-3xl m-4 outline-none" style={{width:"35vw"}} placeholder="SEARCH"></input>
                <div onClick={toggleModal} class="cursor-pointer rounded-full" id="close-modal">
                     <IconContext.Provider  value={{ color: "#81ecec", size:"5vh" }}>
                             <AiFillCloseSquare/>         
                       </IconContext.Provider>
                </div>
                               
            </div>
           <div className="flex justify-center items-center flex-col" >
           {showSearchResults()}
           </div>
        </div>
    </div>


    <div class="bg-black bg-opacity-50 absolute inset-0 hidden justify-center items-center z-50" id="overlay2">
        <div className={[Classes.fileOverlay,'bg-gray-200  py-2 px-3 rounded shadow-xl text-gray-800 items-center justify-center flex flex-row relative'].join(" ")}>
             <div className="absolute p-4" style={{top:'0',right:'0'}}>
                 <button onClick={minimizeFileModal}>
                                <IconContext.Provider  value={{ color: "#81ecec", size:"5vh" }}>
                                            <AiFillCloseSquare/>         
                                </IconContext.Provider>
                 </button>
             </div>
            <div className="w-1/2">
                {showFileThumbnail()}
               
            </div>
            <div className="flex flex-col">
                {showFileDetails()}
                <button className="text-white border-2 border-gray-200 rounded-md mt-3 w-full" 
                style={{width:"15vw" , height:"5vh",backgroundColor:'#7ed6df'}} onClick={onSendFileClick}>SEND</button>
            </div>
        </div>
    </div>

         <div class="bg-black bg-opacity-50 absolute inset-0 hidden justify-center items-center z-10" id="overlay3">
           
                    <div className={[Classes.videoCallOverlay,'bg-gray-200  py-2 px-3 rounded shadow-xl text-gray-800 items-center justify-center flex flex-row relative'].join(" ")}>
                    <div className="w-2/6 flex flex-col items-center justify-center">
                        <div className="border-2 border-red-400 w-full" style={{height:'30vh'}}>
                        <video className="w-full" autoPlay playsInline id="localVideo" style={{height:'30vh'}}></video>
                        </div>
                        <button className="m-4 p-2 border-2 border-blue-400" id='videoCallBtn' onClick={createCall}>CALL</button>
                    </div>
                    <div className="w-5/6 flex flex-col items-center justify-center ">
                        <div className="border-2 border-blue-400 w-full" style={{height:'70vh'}}>
                        <video className="w-full" autoPlay playsInline id="remoteVideo" className="border-2" style={{height:'50vh'}}></video>
                        </div>
                        
                        <button className="m-4 p-2 border-2 border-red-400" onClick={onEndCall}>END CALL</button>
                    </div>
                    
                </div>
        </div>

        <div class="bg-black bg-opacity-50 absolute inset-0 hidden justify-center items-center z-10" id="voiceCallOverlay">
           
                    <div className={[Classes.voiceCallOverlay,'bg-gray-200  py-2 px-3 rounded shadow-xl text-gray-800 items-center justify-center flex flex-row relative'].join(' ')}>
                    <div className="w-2/6 flex flex-col items-center justify-center">
                       <div>
                            {users.pfp === undefined ?
                                <IconContext.Provider  value={{ color: "#81ecec", size:"20vh" }}>
                                            <HiUserCircle/>         
                                </IconContext.Provider> :
                            <img className='mt-auto mb-auto' style={{width:'20vh',height:'20vh',borderRadius:'50%',paddingRight:'5px'}} src={users.pfp}></img>
                                
                                }
                       </div>
                       
                       <audio controls id='localAudio' className='w-full' style={{height:'5vh'}}></audio>
                        <button className="m-4 p-2 border-2 border-blue-400" id='voiceCallBtn' onClick={createCall}>CALL</button>
                    </div>
                    <div className="w-5/6 flex flex-col items-center justify-center ">
                        <div>
                        <IconContext.Provider  value={{ color: "#81ecec", size:"20vh" }}>
                     <div className="cursor-pointer" >
                     {currentChat[2] !== undefined ? <img style={{width:'20vh',height:'20vh',borderRadius:'0%'}} src={currentChat[2]}></img> : <HiUserCircle/>}       
                     </div>
                  </IconContext.Provider>
                        </div>
                        <audio controls className='w-1/2' style={{height:'5vh'}} id='remoteAudio'></audio>                     
                        <button className="m-4 p-2 border-2 border-red-400" onClick={onEndCall}>END CALL</button>
                    </div>
                    
                </div>
        </div>
        <div class="bg-black bg-opacity-50 absolute inset-0 hidden justify-center items-center z-50" id="callOverlay">
                 <div className={[Classes.callOverlay,"bg-gray-200  py-2 px-3 rounded shadow-xl text-gray-800 items-center justify-center flex flex-row relative"].join(' ')} >
                     <h1>INCOMING {call.type} CALL FROM {call.caller}</h1>
                     <button onClick={onAcceptCall} className="m-4 p-2 border-2 border-blue-400">ACCEPT</button>
                     <button onClick={onDeclineCall} className="m-4 p-2 border-2 border-red-400">DECLINE</button>
                </div>
        </div>

       

        
            <div class="bg-gray-200 absolute py-2 px-3 rounded shadow-xl  border-2 border-red-400 text-gray-800 hidden flex-col z-30"  style={{width:"25vw",height:"90vh",right:'0'}} id='mediaElement'>
                <div className='p-2 cursor-pointer ' onClick={toggleMedia}>
                    <IconContext.Provider  value={{ color: "#81ecec", size:"5vh" }}>
                                                <BsFillBackspaceFill/>         
                    </IconContext.Provider>
                </div>
                <div className='p-4 text-center font-semibold text-3xl'>
                    Media
                </div>
                <div className='p-4 overflow-auto grid' style={{gridTemplateColumns:"auto auto auto" , rowGap:'1vh',columnGap:'1vh'}}>
                {showAllMedia()}
                </div>
                
            </div>

            <div class="bg-gray-200 absolute py-2 px-3 rounded shadow-xl  border-2 border-red-400 text-gray-800 hidden flex-col z-30"  style={{width:"25vw",height:"90vh",right:'0'}} id='fileElement'>
                <div className='p-2 cursor-pointer ' onClick={toggleFiles}>
                    <IconContext.Provider  value={{ color: "#81ecec", size:"5vh" }}>
                                                <BsFillBackspaceFill/>         
                    </IconContext.Provider>
                </div>
                <div className='p-4 text-center font-semibold text-3xl'>
                    Files
                </div>
                <div className='p-4 overflow-auto flex flex-col justify-between'>
                    {showAllFiles()}
                </div>
                
            </div>
        
       
        <div className="flex" id={Classes.container}>
            <aside id={Classes.contacts} className="w-1/4 bg-white flex flex-col overflow-y-auto contacts" style={{height:"90vh"}}  >
                <div className='flex' style={{borderBottom:'1px solid #bdc3c7'}}>
                    <input id='contactSI' className="m-3 p-6 rounded-3xl h-1 w-5/6" placeholder="SEARCH" onClick={onSearchBarClick} onChange={onContactSearchChange} style={{backgroundColor:'#ecf0f1'}}></input>
                    <div className='cursor-pointer p-2 hidden' id='contactSearchCloseBtn' onClick={()=>{setContactList(tempContactList);document.getElementById('contactSearchCloseBtn').classList.toggle('hidden');document.getElementById('contactSI').value=''}} >
                    <IconContext.Provider  value={{ color: "#81ecec", size:"5vh" }}>
                             <AiFillCloseSquare/>         
                       </IconContext.Provider>
                </div>
                </div>
                
                {contactList.length > 0 ? showContactList() : <ContactTemplate></ContactTemplate>}
            </aside>
            <section id={Classes.messages} className="w-2/4 bg-white relative messages">
                <div className="border-2 rounded-sm  h-full flex flex-col" style={{border:'1px solid #bdc3c7',borderTop:'none'}}>
                    <div className=" border-b-2 rounded-sm  " style={{height:"6vh"}}>
                        {currentChat.length > 0 ? chatHead() :""}
                    </div>
                    <div id={Classes.msgDiv} className=" border-b-2 rounded-sm  overflow-auto" style={{flex:'1',maxHeight:'73vh',wth:'50vw',overflowX:'hidden'}}>
                        {currentChat.length > 0 ?  OnContactClick(): <MessageTemplate></MessageTemplate>}
  
                    </div>
                    <div className="hidden justify-evenly absolute bottom-0 w-full"style={{flex:'0 0 auto'}} id="messageBox" >
                        <textarea onChange={onMessageChange} id="input" className="w-4/6 float-left m-4 p-8 rounded-md h-1 overflow-hidden" placeholder="SEND MESSAGE "></textarea>
                        <input type="file" className="hidden" id="sendFile" onChange={onSelectFileChange}></input>
                        <IconContext.Provider  value={{ color: "#7ed6df", size:"50px" }}>
                            <div className="cursor-pointer" id="sendFileButton" onClick={onSendFile} style={{marginTop:'auto' , marginBottom:'auto'}}>
                                < ImAttachment/>
                             </div>
                        </IconContext.Provider>
                        <button onClick={onSend} className="float-rightrounded-md p-2">
                            <IconContext.Provider  value={{ color: "#7ed6df", size:"50px" }}>
                                <div className="cursor-pointer" id="sendFileButton"  style={{marginTop:'auto' , marginBottom:'auto'}}>
                                    < IoMdSend/>
                                </div>
                            </IconContext.Provider>
                        </button>
                    </div>
                </div>
              
            </section>
            <aside id={Classes.profile} className="w-1/4  flex flex-col profile" style={{height:"90vh",backgroundColor:'#dfe4ea'}}>
               <div>{currentChat.length > 0 ? profile():<ProfileTemplate></ProfileTemplate>}
                
               </div>
               <div style={{paddingBottom:'3vh'}}>
                   <h1 className="text-lg font-bold text-left mx-3">{currentChat.length>0 ? 'MEDIA' : ''}</h1>
                    <div id='showMore' className="grid mx-3  overflow-hidden" style={{gridTemplateColumns:"7vw 7vw 7vw",columnGap:'1vw' }}>{currentChat.length > 0 ? showMedia():""}</div>
               </div>
               <div >
                   
                    <span className="text-lg font-bold text-left mx-3">{currentChat.length>0 ? 'FILES' : ''}</span>
                    <span className="text-lg font-normal text-left mx-3 float-right cursor-pointer" onClick={toggleFiles} >{currentChat.length>0 ? 'Show All' : ''} </span>


                    <div id='showMore' className="flex mx-3 flex-col overflow-hidden" >{currentChat.length > 0 ? showFiles():""}</div>
               </div>

              
               
            </aside>
        </div>
       </div>
    )
}
 
