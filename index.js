const express = require("express");
const socketio = require("socket.io");
const http = require('http');
const PORT =process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

//Starts the server

app.use(express.static("public"));

//Upgrades the server to accept websockets.

const io = socketio(server);

let connectedUsers = [];            //Store Connected Users SocketId
//Triggered when a client is connected.

io.on("connection", function (socket) {
  connectedUsers.push(socket.id);
  console.log(connectedUsers);

  socket.on("sendingPreOffer",(data)=>{                //preOffer Came to Server 
                                               
   const remoteUserPersonalCode=data.remoteUserPersonalCode;
   const usertype=data.type;

   const connectedUser = connectedUsers.find((SocketId)=>           // Finding If User socketId  is present in connectedUsers array 
     SocketId === remoteUserPersonalCode
   );
   
   
    
    if(connectedUser){
   
      const data={
          remoteUserPersonalCode:socket.id,
          type:usertype,
         
      };
      io.to(remoteUserPersonalCode).emit("sendingPreOffer",data);            //Emitting sendingPreOffer to Other User from server
    }
    else{
      const data={
        preOfferAnswer:"user_not_found",
      };
      io.to(socket.id).emit("preOfferAnswer",data);
    }


  });

  socket.on("preOfferAnswer",(data)=>{     //Implementing PreOfferAnswer and Sending to other connecteduser
   
   const connectedUser =connectedUsers.find((UserSocketId)=>
     UserSocketId===data.socketId
   );
   
    if(connectedUser){
      io.to(data.socketId).emit("preOfferAnswer",data);
    }
    
  });

  socket.on("userEndStream",(data)=>{                 //Receiving end call requeat from local user and sending to remote user 

    const socketId = data.socketId;

    const connectedUser =connectedUsers.find((UserSocketId)=>
     UserSocketId===data.socketId
   );

   if(connectedUser){
     io.to(socketId).emit("userEndStream");
   }
  });


   socket.on("webrtc-signaling",(data)=>{       //Receving webrtcSignaling Offer and Emiting to Other End         

    const connectedUserSocketId =data.connectedUserSocketId;

    const connectedUser =connectedUsers.find((userSocketId)=>
    userSocketId===connectedUserSocketId);

    if(connectedUser){
      io.to(connectedUserSocketId).emit("webrtc-signaling",data);
    }
   });

});

 server.listen(process.env.PORT || 5000, function () {
  console.log(`listenig  ${PORT}`);
});
