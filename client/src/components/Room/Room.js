import React, { useEffect, useState, useRef } from "react"
import server from "../../api/server"
import io from "socket.io-client"
import { IoIosVideocam, IoMdDownload } from "react-icons/io"
import { GoPlus } from "react-icons/go"
import AceEditor from "react-ace"
import Peer from "simple-peer"
import "ace-builds/src-noconflict/mode-javascript"
import "ace-builds/src-noconflict/theme-monokai"
import "./Room.css"

const Room = (props) => {

    const [message, setmessage] = useState("")
    const [showbar, setshowbar] = useState("show")
    const [Peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.room;


    console.log(Peers)
    const EXTPORT = "https://code-share-backend.herokuapp.com"

    useEffect(() => {
        socketRef.current = io.connect(EXTPORT)
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            userVideo.current.srcObject = stream
            socketRef.current.emit("join room", roomID);

            let uid
            //starts here
            socketRef.current.on("all users", res => {
                console.log(res.users[0])
                peersRef.current = []
                setPeers([])
                console.log(Peers)
                console.log(res.users)
                const peers = [];
                uid = res.user
                if (res.user === socketRef.current.id) {
                    res.users.forEach(userID => {
                        console.log(userID)
                        const peer = createPeer(userID, socketRef.current.id, stream);
                        peersRef.current.push({
                            peerID: userID,
                            peer,
                        })
                        peers.push(peer);
                    })
                    setPeers(peers);
                }else if(res.users[0]===socketRef.current.id){
                    
                    let i
                    for(i=1;i<res.users.length;i++){
                        console.log(res.users[i])
                        const peer = createPeer(res.users[i], res.users[0], stream);
                        peersRef.current.push({
                            peerID: res.users[i],
                            peer,
                        })
                        peers.push(peer);
                    }
                }
            })

            socketRef.current.on("user joined", payload => {
                console.log(uid)
                if (payload.callerID === uid) {

                    const item = peersRef.current.find(p => p.peerID === payload.callerID);
                    if (!item) {
                        const peer = addPeer(payload.signal, payload.callerID, stream);
                        peersRef.current.push({
                            peerID: payload.callerID,
                            peer,
                        })
                        setPeers(users => [...users, peer]);
                    }

                }

            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            //ends here

        })

    }, [])

    useEffect(() => {

        server.post("/room", {
            room: roomID
        }).then((res) => {
            if (!res.data.error) {
                //   socketRef.current.emit("join", roomID)
            }
        }).catch((error) => {

        })

    }, [EXTPORT])

    useEffect(() => {

        socketRef.current.on("message", (res) => {
            setmessage(res.message)
        })

    }, [])

    //starts here
    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    //ends here

    const HandleChange = (event) => {
        setmessage(event)
        socketRef.current.emit("SendMessage", event)
    }

    const HandleCamClick = () => {
        if (showbar === "hide") {
            setshowbar("show")

        } else {
            setshowbar("hide")
            //  if (stream !== null) {
            //   stream.getTracks().forEach(track => track.stop())
            //   }
        }
    }

    //starts here
    const Video = (props) => {
        const ref = useRef();

        useEffect(() => {
            props.peer.on("stream", stream => {
                ref.current.srcObject = stream;
            })
        }, []);

        return (
            <video playsInline ref={ref} autoPlay className="video1" />
        );
    }

    //ends here

    return (
        <div className="Rparent">
            <div className="child1">
                <AceEditor mode="javascript" theme="monokai" fontSize={15} value={message} onChange={HandleChange} style={{ width: "100%", height: "100%" }} />
            </div>
            <div id="sidebar" className={showbar}>
                <div className="sbchild1">
                    <div className="img1" onClick={HandleCamClick}>
                        <IoIosVideocam size={20} color="#ffffff" />
                    </div>
                    <div className="img2">
                        <IoMdDownload size={20} color="#ffffff" />
                    </div>
                    <div className="img3">
                        <GoPlus size={20} color="#ffffff" />
                    </div>
                </div>
                <div className="sbchild2">
                    <div className="videodiv1">
                        <video playsInline muted ref={userVideo} autoPlay className="video1" />
                    </div>
                    {Peers.map((peer, index) => {
                        return (
                            <Video key={index} peer={peer} />
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Room
