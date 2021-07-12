import * as balancer from "./balancer.js";


let socket = io();           //Intiliasization Of Socketio Connection

//Getting all elemnets by getElementId
let copyButton = document.getElementById("Copy");    
let personalcode = document.getElementById("personal-code");
let chatCallButton = document.getElementById("chat-button");
let videoCallButton = document.getElementById("video-button");
let userVideo = document.getElementById("user-video");
let peerVideo = document.getElementById("peer-video");
let endcall = document.getElementById("end-call");
let endchat = document.getElementById("end-chat");
let mute = document.getElementById("mute");
let hide = document.getElementById("hide");
let micButtonImg = document.getElementById("mic_button_image");
let hideButtonImg = document.getElementById("camera_button_image");
var send = document.getElementById("send");
var username = document.getElementById("username");
var output = document.getElementById("output");
var chatcontainer = document.getElementById("chat-container");
let startRecordingButton=document.getElementById("start_recording_button");
let maincontainer = document.getElementById("main-container");
let screenShareButton = document.getElementById("screenShare");
let pauserecording=document.getElementById("pause-button");
let stoprecording=document.getElementById("stop-button");
let resumerecording=document.getElementById("resume-button");


let peerConcn;                //defining peerConnection




let dataChannel;                     //defining dataChannel

let state = {                    //store some useful information
  userStream: null,
  peerStream: null,
  socketId: null,
  screenShareOn: false,
  setScreenSharingStream: null,
  callCurrentState:'Only Chat Call',

}
let socketIO = null;
let connectedUserDetails;
                                   
let iceServers = {                      // Contains the stun server URL we will be using.
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};


socket.on("connect", () => {                //Connecting to server
  socketIO = socket;
  console.log("succesfully connected to server")
  state.socketId = socket.id;
  personalcode.value = socket.id;                             //updating personal code everytime while connecting to server
});
                                                                
copyButton.addEventListener("click", () => {                      //implementing copy button for copying personal code
  const copyCode = state.socketId;
  navigator.clipboard && navigator.clipboard.writeText(copyCode);
});



chatCallButton.addEventListener("click", () => {                //Implementing Chat call 
 
  const remoteUserPersonalCode = document.getElementById("input-personal-code").value;
  sendingOffer('Chat type', remoteUserPersonalCode);             //sending Chat call Offer 

});



videoCallButton.addEventListener("click", () => {             //implementing Video call
  
  const remoteUserPersonalCode = document.getElementById("input-personal-code").value;
  sendingOffer('Video type', remoteUserPersonalCode);              //sending Video call Offer

});



const getUserPreview = () => {              //Getting User Media
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .then(function (stream) {
      state.userStream = stream;                 
      userVideo.srcObject = stream;
      userVideo.onloadedmetadata = function (e) {
        userVideo.play();
      };
      state.callCurrentState='Video Call Available';
    })
    .catch(function (err) {
      /* handle the error */
      alert("Couldn't Access User Media Due To Some Error");
    });
};

getUserPreview();             


const sendingOffer = (type, remoteUserPersonalCode) => {       //implementing Send PreOffer from localuser to server

  connectedUserDetails = {
    type,
    socketId: remoteUserPersonalCode,
  }

  const data = {
    type,
    remoteUserPersonalCode,
  };
  balancer.showCallingCallBox(callingCallBoxRejectCallManager);     //Showing CallBox to User While Sending Offer
  state.callCurrentState='Call Unavailable';
  console.log("sending preoffer to server");
  socket.emit("sendingPreOffer", (data));                         //Emiting to server and passing data
};


socket.on("sendingPreOffer", (data) => {                //implementing and handling the preOffer that came from server           
   
  const type= data.type;
  const remoteUserPersonalCode=data.remoteUserPersonalCode;

  if(!checkCallPosibility()){
    return sendingPreOfferAnswer("user_busy",remoteUserPersonalCode);
  }

  connectedUserDetails = {
    socketId: remoteUserPersonalCode,
    type,
  };

  state.callCurrentState='Call Unavailable'; 

  if (type === 'Video type' || type === 'Chat type') {

     balancer.showIncomingCallBox(type,acceptCallManager,rejectCallManager);        //Showing IncomingCall callBox to the user on the basis of accepting or rejecting call  
  }
});


const createPeerConnection = () => {                      //createPeerConnection 
  peerConcn = new RTCPeerConnection(iceServers);

  dataChannel = peerConcn.createDataChannel("chat");          //creating data channel

  peerConcn.ondatachannel = (event) => {                    
    const dataChannel = event.channel;
    dataChannel.onmessage = (event) => {                         //Displaying and handling messsage 
      const data = JSON.parse(event.data);
      output.innerHTML += "<p><strong>" + data.username + ":</strong>" + data.message + "</p>";
    };
  };

  peerConcn.onicecandidate = (event) => {
    if (event.candidate) {                                     //Sending Our Ice Candidate to Other User
      const data = {
        connectedUserSocketId: connectedUserDetails.socketId,
        type: "ice-candidate",
        candidate: event.candidate,
      }
      socket.emit("webrtc-signaling", data);
    }
  };

  peerConcn.onconnectionstatechange = (event) => {
    if (peerConcn.connectionState === "connected") {
       peerVideo.onloadedmetadata = function (e) {                     //Playing Peer Stream
         peerVideo.play();
       };

    }
  };


  const remoteStream = new MediaStream();               // receiving tracks
  state.peerStream = remoteStream;
  peerVideo.srcObject = remoteStream;
  peerConcn.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };



  if (connectedUserDetails.type === 'Video type') {             // If Call is Video type add our stream to peer connection
    const localStream = state.userStream; 

    for (const track of localStream.getTracks()) {
      peerConcn.addTrack(track, localStream);
    }
  }
};

const sendMessage = (message, username) => {      //passing message and username to datachannel

  const data = {
    message,
    username,
  }
  dataChannel.send(JSON.stringify(data)); 
  
}


const newMessageInput = document.getElementById("message-input");
newMessageInput.addEventListener("keydown", (event) => { 
  const pressedkey = event.key;

  if (pressedkey === "Enter") {   //while pressing enter sending username and message
    sendMessage(event.target.value,username.value);
    output.innerHTML += "<p><strong>" + username.value + ":</strong>" + newMessageInput.value + "</p>";
    newMessageInput.value = '';
  }
});

send.addEventListener("click", () => {    //while pressing send sending username and message
  const message = newMessageInput.value;
  sendMessage(message, username.value);
  output.innerHTML += "<p><strong>" + username.value + ":</strong>" + message + "</p>";
  newMessageInput.value = '';
});

export const acceptCallManager = () => {       //if call accepted then implementing preOfferAnswer to server
  
  createPeerConnection();
  sendingPreOfferAnswer("call_accepted");

  if (connectedUserDetails.type === 'Chat type') {
    chatcontainer.style = "display:flex";
    endchat.style = "display:inline";
  }
  if (connectedUserDetails.type === 'Video type') {
    peerVideo.style = "display:inline";
    endcall.style = "display:inline";
    screenShareButton.style = "display:inline";
    startRecordingButton.style="display:inline";
    chatcontainer.style = "display:flex";
  }

};




export const rejectCallManager = () => {         //if call rejected then implementing preOfferAnswer to server
  
   sendingPreOfferAnswer();
   setIncomingCallsAvailable();
  sendingPreOfferAnswer("call_rejected");
};




socket.on("preOfferAnswer", (data) => {      //PreOffer Came From Server Implementing It On The Basis Of PreOfferAnswer
  const preOfferAnswer  = data.preOfferAnswer;
  balancer.removeCallBox();


  if (preOfferAnswer === "user_not_found") {         //If Callee Not Found
    
    balancer.showCallBoxInfo(preOfferAnswer);          //Showing callBox To Other User that Callee Not Found 
    setIncomingCallsAvailable();
  
  }

  if (preOfferAnswer === "user_busy") {                   //If Callee Is Busy With Any Other User Call
    setIncomingCallsAvailable();
    balancer.showCallBoxInfo(preOfferAnswer);              //Showing callBox To Other User that Callee is Busy
    
  }

  if (preOfferAnswer === "call_rejected") {               //If Callee Rejected the Call
    setIncomingCallsAvailable();
    balancer.showCallBoxInfo(preOfferAnswer);              //Showing callBox To Other User that Callee Rejected Your Call
    
  }

  if (preOfferAnswer === "call_accepted") {                  //If Callee Accepted Your Call
    
    createPeerConnection();                                       //call Accepted Hence Creating Peer Connection 
    sendingWebRTCOffer();                                            //call Accepted Sending WebRTC Offer
    if (connectedUserDetails.type === 'Chat type') {            //If Accepted Call Was A Chat type Call Showing Chat Container and End Chat button   
      chatcontainer.style = "display:flex";
      endchat.style = "display:inline";
    }
    if (connectedUserDetails.type === 'Video type') {          //If Accepted Call Was A Chat type Call Showing Video Container , All Buttons and Chat Container
      peerVideo.style = "display:inline";
      chatcontainer.style = "display:flex";
      endcall.style = "display:inline";
      startRecordingButton.style="display:inline";
      screenShareButton.style = "display:inline";
     
    }
    

  }
});

socket.on("webrtc-signaling", (data) => {                         //getting webrtc signaling through server

  if(data.type==="offer"){
    handleWebRTCOffer(data);
  }
  else if(data.type==="answer"){
    handleWebRTCAnswer(data);
  }
  else if(data.type==="ice-candidate"){
    handleWebRTCCandidate(data);
  }
  else{
    return;
  }

});

const callingCallBoxRejectCallManager = () => {          //  if caller Rejected the call
  const data={
    socketId:connectedUserDetails.socketId,
  };
  closeAllConnection(); 

  socket.emit("userEndStream",data);

};

const sendingPreOfferAnswer = (preOfferAnswer,remoteUserPersonalCode= null) => {
  
  const SocketID=remoteUserPersonalCode ?
   remoteUserPersonalCode:
   connectedUserDetails.socketId;  
  const data = {
    socketId: SocketID,
    preOfferAnswer,
  }
  balancer.removeCallBox();
  socket.emit("preOfferAnswer", data);                //sending PreOffer to Server
}




const sendingWebRTCOffer = async () => {                    //sending WebrtcOffer to server
  const offer = await peerConcn.createOffer();              //creating sdp information
  await peerConcn.setLocalDescription(offer);               // saving that offer as local description
  const data = {
    connectedUserSocketId: connectedUserDetails.socketId,
    type: "offer",
    offer: offer,
  }
  socket.emit("webrtc-signaling", data);                        //sending that offer so remote user also set as remote description 
};



const handleWebRTCOffer = async (data) => {               
  await peerConcn.setRemoteDescription(data.offer);              // saving that offer as local description which is coming from local user
  const answer = await peerConcn.createAnswer();                  //creating sdp information
  await peerConcn.setLocalDescription(answer);                    //saving answer as remote user local description
  const details = {
    connectedUserSocketId: connectedUserDetails.socketId,
    type: "answer",
    answer: answer,
  };
  socket.emit("webrtc-signaling", details);                         //sending back answer to local user through server
  
};



const handleWebRTCAnswer = async (data) => {
  const answer=data.answer
  await peerConcn.setRemoteDescription(answer);                    // saving that answer as remote description which is coming from remote user
};

const handleWebRTCCandidate = async (data) => {                        //handling ice-candidate

  try {
    await peerConcn.addIceCandidate(data.candidate);
  }
  catch (err) {
    console.error("error occured while adding received ice candidate from other side", err);
  }
};


mute.addEventListener("click", function muteMic() {                //implementing mute and unmute user mic functionality
  state.userStream.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled

    micButtonImg.src=(micButtonImg.src.match("./images/mic.png")) ?
    "./images/micOff.png":
     "./images/mic.png";


  });
});

hide.addEventListener("click", function hideVideo() {              //implementing hide and unhide user video functionality
  state.userStream.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled
    hideButtonImg.src =(hideButtonImg.src.match("./images/camera.png"))?
     "./images/cameraOff.png":
     "./images/camera.png";
    
    
  });

});


//implementing screen sharing functionality

let screenSharingStream;

screenShareButton.addEventListener("click", () => {
  const screenShareOn = state.screenShareOn;
  shareScreenToOtherEnd(screenShareOn)
});


const shareScreenToOtherEnd = async (screenShareOn) => {
  if (screenShareOn) {                              // If ScreenSharing is On (Active)  implementing how to switch to my camera back
    const uStream = state.userStream;
    const users = peerConcn.getSenders();

    const user = users.find((user) =>                  //find sender which matching userstram
      
          user.track.kind === uStream.getVideoTracks()[0].kind
    );

    if (user) {
      user.replaceTrack(uStream.getVideoTracks()[0]);
   
    }

    state.setScreenSharingStream.getTracks().forEach((track) => track.stop());   //Stoping  Screensharingstream Tracks

    state.screenShareOn = !screenShareOn;                                       //updating screenSharingOn
    userVideo.srcObject = uStream;
    
    
    userVideo.addEventListener("loadedmetadata", () => {
      userVideo.play();
    });

    

  }
  else {                                    //If User Not Sharing Screen Currently
  
    try {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      state.setScreenSharingStream = screenSharingStream;

      const users = peerConcn.getSenders(); //replacing track with which sender is sharing

      const user = users.find((user) => {
        return (
          user.track.kind === screenSharingStream.getVideoTracks()[0].kind);
      });

      if (user) {
        user.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }
      state.screenShareOn = !screenShareOn;
      userVideo.srcObject = screenSharingStream;    //Update Screensharingstream To localuser Video
      userVideo.addEventListener("loadedmetadata", () => {
        userVideo.play();
      });
    }
    catch (err) {                                      //error occured when trying to share screen
      console.error('error occured in sharing screen');
    }
  }
};

  //Implementing Stream Recording

let streamRecorder;                                  
const recordedeData =[];               //storing recordedStream data

const vp9 = 'video/webm; codecs=vp=9';   //Media Recorder Codecs

const vp9Options ={MimeType: vp9};

const startStreamRecording =()=>{

  const peerStream = state.peerStream;

  streamRecorder = (MediaRecorder.isTypeSupported(vp9))?
  new MediaRecorder(peerStream,vp9):
   streamRecorder = new MediaRecorder(peerStream);


  streamRecorder.ondataavailable = manageAvailableData;
  streamRecorder.start();

}

const downloadRecordedVideo =()=>{
  const blob =new Blob(recordedeData,{
    type:'video/webm'
  });

  const url =URL.createObjectURL(blob);      //defining url and Implementing download the recordedstream 
  const a= document.createElement('a');
  document.body.appendChild(a);
  a.style='display:none';
  a.href=url;
  a.download='recordingStream.webm';              
  a.click();
  window.URL.revokeObjectURL(url);
}

const manageAvailableData =(event)=>{
  if(event.data.size >0){
    recordedeData.push(event.data);
    downloadRecordedVideo();

  }
}

const showRecordingPanel=()=>{                              //displaying recording buttons after recording strated
  const recordingButtons = document.getElementById("recording-stream-buttons");
  recordingButtons.style="display:flex";
  stoprecording.style="display:inline";
  pauserecording.style="display:inline";
  startRecordingButton.style="display:none";
}

const resetRecordingButtons=()=>{
  const recordingButtons = document.getElementById("recording-stream-buttons");

  startRecordingButton.style="display:inline";
  recordingButtons.style="display:none";
}



startRecordingButton.addEventListener("click",()=>{
  startStreamRecording();
  showRecordingPanel();
});



 const stopRecordingButton =document.getElementById("stop-button");
stopRecordingButton.addEventListener("click",()=>{
  streamRecorder.stop();                    //stop recording
  resetRecordingButtons();
})


resumerecording.addEventListener("click",()=>{
   resumerecording.style="display:none";
   pauserecording.style="display:inline";
   streamRecorder.resume();                         //resume recording
});

pauserecording.addEventListener("click",()=>{
  pauserecording.style="display:none";
  resumerecording.style="display:inline";
  streamRecorder.pause();                            //pause recording
  
})

//Implementing End Call functionality


endcall.addEventListener("click", () => {                  //implementing end call functionality
 
    const data = {
      socketId: connectedUserDetails.socketId,
    };
    socket.emit("userEndStream", data);                    // sending request endcall to server   
    closeAllConnection();

  
});

endchat.addEventListener("click", () => {                             //implementing end chat functionality
                                                                
    const data = {
      socketId: connectedUserDetails.socketId,
    };
    socket.emit("userEndStream", data);                    //sending request endcall to server
    closeAllConnection();
 
  
});


socket.on("userEndStream", () => {                     //Receving End call request from server  and closing all connection from remote end
  closeAllConnection();
});


const closeAllConnection = () => {                    //closing all peer connection
  if (peerConcn) {
    peerConcn.close();
    peerConcn = null;
  }

 
  if (connectedUserDetails.type === 'Video type') {
    state.userStream.getAudioTracks()[0].enabled =true;       //resetting  localuder audio tracks as true when the call ends 
    state.userStream.getVideoTracks()[0].enabled =true;         //resetting  localuser video tracks as true when the call ends 
  
    hideButtonImg.src ="./images/camera.png";
    micButtonImg.src="./images/mic.png";
  }
  
   updateAfterEndStream(connectedUserDetails.type);
   setIncomingCallsAvailable();                              
    connectedUserDetails=null;
  
}

const updateAfterEndStream = (type) => {                        //updating chat container, video container and buttons on the basis of call type

  if (type === 'Video type') {
    
    peerVideo.style = "display:none" ;
    endcall.style = "display:none";
    screenShareButton.style = "display:none";
    startRecordingButton.style="display:none";
    chatcontainer.style="display:none";
  }
  else{
    endchat.style="display:none";
    chatcontainer.style="display:none";
  }
  
  balancer.removeCallBox();

};

const checkCallPosibility =(type)=>{                             //checking all possibility of call
  const callState= state.callCurrentState;

  if(callState === 'Video Call Available'){
  return true;}

  if(type === 'Video type' && callState === 'Only Chat Call'){
    return false;
  }

  return false;
};

const setIncomingCallsAvailable =()=>{                                  //checking which type of call available

  state.callCurrentState=(state.userStream)?
  'Video Call Available': 
  'Only Chat Call';
  
}
    