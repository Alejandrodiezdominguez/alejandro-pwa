// https://www.youtube.com/watch?v=vK2NoOoqyRo
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
  getFirestore, collection, getDocs,
  addDoc, deleteDoc, doc, GeoPoint
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';

import {
  getStorage, ref, getDownloadURL, uploadString
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyAjYBxeAfG9k2IQKneIuNztWidRWxekYls",
  authDomain: "nth-boulder-337209.firebaseapp.com",
  projectId: "nth-boulder-337209",
  storageBucket: "nth-boulder-337209.appspot.com",
  messagingSenderId: "1078031700000",
  appId: "1:1078031700000:web:ff0fed218f74a920b6ac45"
};

//init app
const firebaseApp = initializeApp(firebaseConfig);

//firebase Storage for image upload
const storage = getStorage(firebaseApp);

//firebase firestore for image upload
const db = getFirestore()

//the collection of the firebase
const colRef = collection(db, 'Photos')

let position

//get the uploadform
const addPhotoForm = document.querySelector('.add')
if (addPhotoForm) {

  //get form elements
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const snap = document.getElementById("snap");
  const errorMsgElement = document.querySelector('span#errorMsg');
  const submitbtn = document.getElementById('submitbtn');

  const constraints = {
    audio: false,
    video: {
      width: 400, height: 400
    }
  };

  // Access webcam
  async function init() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      handleSuccess(stream);
    } catch (e) {
      errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
    }
  }

  // if webcam acces success 
  function handleSuccess(stream) {
    window.stream = stream;
    video.srcObject = stream;
  }

  // Load init
  init();

  // Draw image
  var image = new Image();
  var context = canvas.getContext('2d');
  snap.addEventListener("click", function () {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    image.id = "pic";
    image.src = canvas.toDataURL();

    setTimeout(function () {
      console.log("Ready")
    }, 10000);
    //create a filename of the picture
    var fileName = new Date() + '-' + 'base64';
    const storageRef = ref(storage, fileName);
    //upload the images
    const upload = uploadString(storageRef, image.src, "data_url").then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadurl) => {
        //get uploadurl of the image and set it to the url of the form
        addPhotoForm.url.value = downloadurl.toString();
      })
    });
  }
  );


  //submit the form
  submitbtn.addEventListener('click', (e) => {
    e.preventDefault()

  //checks is picture was uploaded before submitting the form 
    if (!addPhotoForm.url.value) {
      e.preventDefault()
      alert('take a picture first before submitting a form')
      return false
    }
    //checks is tag was provided before submitting the form 
    else if (!addPhotoForm.name.value) {
      e.preventDefault()
      alert('Provide a tag before submitting a form')
      return false
    }

    const currentPosition = document.getElementById('currentpos');
    const latitude_form = document.getElementById('lat');
    const longnitude_form = document.getElementById("lng");

    //if the currentposition radio button is checked
    if (currentPosition.checked) {
      //then it shuold get the current position
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          //and put the latitude and the longitude in a firebase GeoPint object
          position = new GeoPoint(pos.coords.latitude, pos.coords.longitude);
          //after that the name, current position and url are uploaded to the firebase firestore
          addDoc(colRef, {
            name: addPhotoForm.name.value,
            position: position,
            url: addPhotoForm.url.value,
          }).then(() => {
            //after submitting their should appear a successfull message
            alert("form submitted succesfully")
            //and the form as well as the canvas should reset
            addPhotoForm.reset()
            context.clearRect(0, 0, canvas.width, canvas.height);
            //and the user will be redirected to main page
            window.location.href = "/index.html";
          })

        },
        //if user has no cam a error message should appear
          function (error) {
            if (error.code == error.PERMISSION_DENIED) {
              alert("User denied the request for Geolocation.")
            }
          }

        )
      } else {
        //alert if  geopoint is not reachable or not supported
        alert("Geolocation not supported")
      }

    }
    //form validation for latitdude and longitude fields
    else if (addPhotoForm.latitude.value == "" || addPhotoForm.longnitude.value == "") {
      alert('please provide values for latitude and longnitude')
    }
    else {
      if (addPhotoForm.latitude.value > 90 || addPhotoForm.latitude.value < -90) {
        alert("Latitude must be a number between -90 and 90 but was: " + addPhotoForm.latitude.value)
      }
      if (addPhotoForm.longnitude.value > 180 || addPhotoForm.latitude.value < -180) {
        alert("Longnitude must be a number between -90 and 90 but was: " + addPhotoForm.longnitude.value)
      }
      //uploads the name, self entered position and the url of the image
      addDoc(colRef, {
        name: addPhotoForm.name.value,
        position: new GeoPoint(addPhotoForm.latitude.value, addPhotoForm.longnitude.value),
        url: addPhotoForm.url.value
      }).then(() => {
         // form and canvas reset
         addPhotoForm.reset()
         context.clearRect(0, 0, canvas.width, canvas.height);
         //and the user will be redirected to main page
         window.location.href = "/index.html";
      })
    }

  })
}