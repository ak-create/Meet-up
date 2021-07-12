import * as chat from "./chat.js";

export const showIncomingCallBox=(type,acceptCallManager,rejectCallManager)=>{        //Showing IncomingCall callBox to the user on the basis of accepting or rejecting call  
  
   const typedetails = type==='Chat type' ? "Chat":"Video";

   const callBox =document.createElement('div');
   callBox.classList.add('callBox-wrapper');
   const callBoxContent = document.createElement('div');
   callBoxContent.classList.add('callBox_content');
   callBox.appendChild(callBoxContent);

   const heading =document.createElement("p");
   heading.classList.add("callBox_heading");
   heading.innerHTML=`Incoming ${typedetails} Call`;

   const imgHolder =document.createElement("div");
   imgHolder.classList.add("callBox_img_holder");
   const img =document.createElement("img");
   img.src="./images/callBox.png";
   imgHolder.appendChild(img);

   const buttonHolder =document.createElement("div");
   buttonHolder.classList.add("callBox_button_Holder");

   const acceptButton =document.createElement("button");
   acceptButton.classList.add("callBox_accept_button");
   const acceptImg=document.createElement("img");
   acceptImg.classList.add("callBox_button_img");
   acceptImg.src="./images/acceptCall.png";
   acceptButton.append(acceptImg);
   buttonHolder.appendChild(acceptButton);

   const rejectButton =document.createElement("button");
   rejectButton.classList.add("callBox_reject_button");
   const rejectImg=document.createElement("img");
   rejectImg.classList.add("callBox_button_img");
   rejectImg.src="./images/rejectCall.png";
   rejectButton.append(rejectImg);
   buttonHolder.appendChild(rejectButton);
   


   callBoxContent.appendChild(heading);
   callBoxContent.appendChild(imgHolder);
   callBoxContent.appendChild(buttonHolder);

  
 
   const callBoxHTML =document.getElementById("call-box");
   callBoxHTML.appendChild(callBox);

   acceptButton.addEventListener("click",()=>{           
      chat.acceptCallManager();
   });

   rejectButton.addEventListener("click",()=>{
      chat.rejectCallManager();
   });
 

};

export const showCallingCallBox=(callingCallBoxRejectCallManager)=>{           //Showing CallBox to User While Sending Offer

   const callBox =document.createElement('div');
   callBox.classList.add('callBox-wrapper');
   const callBoxContent = document.createElement('div');
   callBoxContent.classList.add('callBox_content');
   callBox.appendChild(callBoxContent);

   const heading =document.createElement("p");
   heading.classList.add("callBox_heading");
   heading.innerHTML=`Calling`;

   const imgHolder =document.createElement("div");
   imgHolder.classList.add("callBox_img_holder");
   const img =document.createElement("img");
   img.src="./images/callBox.png";
   imgHolder.appendChild(img);

   const buttonHolder =document.createElement("div");
   buttonHolder.classList.add("callBox_button_Holder");

   const rejectCallButton =document.createElement('button');
   rejectCallButton.classList.add('callBox_reject_button');
   const rejectCallImg=document.createElement("img");
   rejectCallImg.classList.add("callBox_button_img");
   rejectCallImg.src="./images/rejectCall.png";
   rejectCallButton.append(rejectCallImg);
   buttonHolder.appendChild(rejectCallButton);

   callBoxContent.appendChild(heading);
   callBoxContent.appendChild(imgHolder);
   callBoxContent.appendChild(buttonHolder);

   
   const callBoxHTML =document.getElementById("call-box");
   callBoxHTML.appendChild(callBox);

   rejectCallButton.addEventListener("click",()=>{
      chat.rejectCallManager();
   });



};

export const removeCallBox =()=>{
   const callBox =document.getElementById('call-box');
 callBox.querySelectorAll("*").forEach((callBox) => callBox.remove());
   
 
};

 const getcallBoxInfo =(callBoxHeading,callBoxDescription)=>{       //Creating Different Different callBOx On the Basis Of Tittle And Description
   const callBox =document.createElement('div');
   callBox.classList.add('callBox-wrapper');
   const callBoxContent = document.createElement('div');
   callBoxContent.classList.add('callBox_content');
   callBox.appendChild(callBoxContent);

   const heading =document.createElement("p");
   heading.classList.add("callBox_heading");
   heading.innerHTML=callBoxHeading;

   const imgHolder =document.createElement("div");
   imgHolder.classList.add("callBox_img_holder");
   const img =document.createElement("img");
   img.src="./images/callBox.png";
   imgHolder.appendChild(img);

   const description = document.createElement("p");
   description.classList.add('callBox_description');
   description.innerHTML =callBoxDescription;

   callBoxContent.appendChild(heading);
   callBoxContent.appendChild(imgHolder);
   callBoxContent.appendChild(description);

   
   return callBox;
}

export const showCallBoxInfo = (preOfferAnswer) =>{        //Creating Different Different callBOx On the Basis Of PreOfferAnswer
   let callBoxInfo =null;

   if(preOfferAnswer === "call_rejected"){
    
      callBoxInfo = getcallBoxInfo('Call Rejected','User rejected your call')    
   }

   if(preOfferAnswer === "user_not_found"){
      callBoxInfo = getcallBoxInfo('User Not Found','Personal code may be wrong')
   }

   if(preOfferAnswer === "user_busy"){
      callBoxInfo = getcallBoxInfo('Call is not Possible','User busy try later')
   }

   if(callBoxInfo){
      const callBox =document.getElementById("call-box");
      callBox.appendChild(callBoxInfo);

      setTimeout(()=>{                              // setting Timeout for CallBox
         removeCallBox();
      },[6123]);
   }

};

