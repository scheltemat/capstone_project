import React, {createElement, useEffect, useState, useRef} from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'
import {keys} from './secret.js'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

mapboxgl.accessToken = `${keys.mapboxToken}`;

const App = () => {
  
  const [restrooms, setRestrooms] = useState([])
  const [userLat, setUserLat] = useState()
  const [userLng, setUserLng] = useState()
  const [show, setShow] = useState(false);

  const [navigation, setNavigation] = useState("")

  const [name, setName] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [directions, setDirections] = useState("")
  const [comment, setComment] = useState("")
  const [ada, setAda] = useState()
  const [changingTable, setChangingTable] = useState()
  const [upVote, setUpVote] = useState("")
  const [downVote, setDownVote] = useState("")
  const [unisex, setUnisex] = useState()
  const [restLat, setRestLat] = useState("")
  const [restLng, setRestLng] = useState("")

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);



  useEffect(() => {
    createMap()
  }, [navigation])



  const createMap = () => {
    const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [-95.37, 29.76], // starting position [lng, lat]
      zoom: 9 // starting zoom
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true
      })
    );

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    
    map.addControl(geolocate); // Add the control to the map.
    map.on('load', () => {
      geolocate.trigger();
    });

    let restroomList;
    const options = {
      enableHighAccuracy: true,
      timeout: 50000,
      maximumAge: 0
    };

    const success = async (pos)=> {
      const crd = pos.coords;
      setUserLat(crd.latitude)
      setUserLng(crd.longitude)
  
      console.log('Your current position is:');
      console.log(`Latitude : ${crd.latitude}`);
      console.log(`Longitude: ${crd.longitude}`);
      console.log(`More or less ${crd.accuracy} meters.`);
  
      let results = await fetch(`https://www.refugerestrooms.org/api/v1/restrooms/by_location?page=1&per_page=50&offset=0&lat=${crd.latitude}&lng=${crd.longitude}`)
      
      restroomList = await results.json()
      // console.log('success', restroomList)
      setRestrooms(restroomList)
      restroomList.forEach((restroom)=>{

        // console.log('here', restroom)

        let marker = new mapboxgl.Marker()
          .setLngLat([restroom.longitude, restroom.latitude])
          .addTo(map)
          
        marker.getElement().addEventListener('click', (e)=>{
          console.log([restroom.longitude, restroom.latitude]);
          restroomModal(restroom)
          handleShow()

          // if(userLat !== undefined && restLat !== undefined){
            getDirections()
          

          // console.log(navigation);
          // map.addSource('safe-restrooms', {
          //   'type': 'geojson',
          //   'data': navigation
          // });
        })
      })
    }
    
    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);

  }

  const restroomModal = (restroom) => {
    setName(restroom.name)
    setStreet(restroom.street)
    setCity(restroom.city)
    setState(restroom.state)
    setDirections(restroom.directions)
    setComment(restroom.comment)
    setAda(restroom.ada)
    setUnisex(restroom.unisex)
    setChangingTable(restroom.changingTable)
    setUpVote(restroom.upVote)
    setDownVote(restroom.downVote)
    setRestLat(restroom.latitude)
    setRestLng(restroom.longitude)

  }

  const getDirections = async () => {
    // console.log(userLat, userLng);

    let results = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${userLng}%2C${userLat}%3B${restLng}%2C${restLat}?alternatives=true&geometries=geojson&language=en&overview=simplified&steps=true&access_token=${keys.mapboxToken}`)

    let directions = await results.json()
    setNavigation(directions)
    console.log(directions);
    
    // setShow(false)
  }
  
  return (
    <>

      <div id='map' style={{width: "700px", height: "400px"}}></div> 

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h4>{street}, {city}, {state}</h4>
            <p>{directions}</p>
            <p>{comment}</p>
          </div>
          <div>
            <p>Unisex: {unisex?"Yes":"No"}</p>
            <p>Accessible: {ada?"Yes":"No"}</p>
            <p>Changing Table: {changingTable?"Yes":"No"}</p>
          </div>
          <div>
            <p>Upvotes: {upVote}</p>
            <p>Downvotes: {downVote}</p>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary">
            Navigation
          </Button>
        </Modal.Footer>
      </Modal> 

    </>
  )
}
export default App