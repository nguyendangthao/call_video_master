import h from './helpers.js';

window.addEventListener('load', () => {
    const room = document.getElementById("currentRoom") ? document.getElementById("currentRoom").innerText : "room";
    const username = document.getElementById("userLogin") ? document.getElementById("userLogin").innerText : "A";
    if (!room) {
        //do something
    } else if (!username) {
        //do something
    } else {

        var pc = [];
        let socket = io('/stream');
        var socketId = '';
        var myStream = '';
        var screen = '';
        var recordedStream = [];
        var mediaRecorder = '';
        var audio = document.getElementById("audiocall");
        var interval = '';
        var isCalling = false;
        socket.on('connect', () => {
            //set socketId
            socketId = socket.io.engine.id;
            socket.emit('subscribe', {
                room: room,
                socketId: socketId
            });
            socket.on('new user', (data) => {
                socket.emit('newUserStart', { to: data.socketId, sender: socketId });
                pc.push(data.socketId);
                init(true, data.socketId);
            });

            socket.on('newUserStart', (data) => {
                pc.push(data.sender);
                init(false, data.sender);
            });

            socket.on('ice candidates', async (data) => {
                data.candidate ? await pc[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate)) : '';
            });
            socket.on('startcall', async (data) => {
                if (data.username != username) {
                    audio.play();
                    interval = setInterval(function () { audio.play(); }, 1000);
                    h.toggleModal('confirm-options-modal', true);
                    document.getElementById('txtConfirmCall').innerHTML = 'Bạn có cuộc gọi từ ' + data.username + ' nhóm ' + room;

                }
            });
            socket.on('closetcall', async (data) => {
                if (data.username != username) {
                    h.toggleModal('confirm-options-modal', false);
                    audio.pause();
                    clearInterval(interval);
                    alert(`Bạn có cuộc gọi nhỡ từ ${data.username}`);
                }
            });
            socket.on('outcall', async (data) => {
                alert(` ${data.username} đã thoát trò chuyện.`);
            });
            socket.on('sdp', async (data) => {
                if (data.description.type === 'offer') {
                    data.description ? await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description)) : '';

                    h.getUserFullMedia().then(async (stream) => {
                        if (!document.getElementById('local').srcObject) {
                            h.setLocalStream(stream);
                        }
                        //save my stream
                        myStream = stream;
                        stream.getTracks().forEach((track) => {
                            pc[data.sender].addTrack(track, stream);
                        });

                        let answer = await pc[data.sender].createAnswer();
                        await pc[data.sender].setLocalDescription(answer);
                        socket.emit('sdp', { description: pc[data.sender].localDescription, to: data.sender, sender: socketId });
                    }).catch((e) => {
                        console.error(e);
                    });
                } else if (data.description.type === 'answer') {
                    await pc[data.sender].setRemoteDescription(new RTCSessionDescription(data.description));
                }
            });
        });

        function init(createOffer, partnerName) {
            pc[partnerName] = new RTCPeerConnection(h.getIceServer());

            if (screen && screen.getTracks().length) {
                screen.getTracks().forEach((track) => {
                    pc[partnerName].addTrack(track, screen);//should trigger negotiationneeded event
                });
            } else if (myStream) {
                myStream.getTracks().forEach((track) => {
                    pc[partnerName].addTrack(track, myStream);//should trigger negotiationneeded event
                });
            } else {
                h.getUserFullMedia().then((stream) => {
                    //save my stream
                    myStream = stream;
                    stream.getTracks().forEach((track) => {
                        pc[partnerName].addTrack(track, stream);//should trigger negotiationneeded event
                    });
                    h.setLocalStream(stream);
                }).catch((e) => {
                    console.error(`stream error: ${e}`);
                });
            }
            //create offer
            if (createOffer) {
                pc[partnerName].onnegotiationneeded = async () => {
                    let offer = await pc[partnerName].createOffer();
                    await pc[partnerName].setLocalDescription(offer);
                    socket.emit('sdp', { description: pc[partnerName].localDescription, to: partnerName, sender: socketId });
                };
            }

            //send ice candidate to partnerNames
            pc[partnerName].onicecandidate = ({ candidate }) => {
                socket.emit('ice candidates', { candidate: candidate, to: partnerName, sender: socketId });
            };

            //add
            pc[partnerName].ontrack = (e) => {
                let str = e.streams[0];
                if (document.getElementById(`${partnerName}-video`)) {
                    document.getElementById(`${partnerName}-video`).srcObject = str;
                } else {
                    //video elem
                    let newVid = document.createElement('video');
                    newVid.id = `${partnerName}-video`;
                    newVid.srcObject = str;
                    newVid.autoplay = true;
                    newVid.className = 'remote-video';

                    //video controls elements
                    let controlDiv = document.createElement('div');
                    controlDiv.className = 'remote-video-controls';
                    controlDiv.innerHTML =
                        `<i class="fa fa-expand text-white expand-remote-video" title="Expand"></i>`;

                    //create a new div for card
                    let cardDiv = document.createElement('div');
                    cardDiv.className = 'card-sm';
                    cardDiv.id = partnerName;
                    cardDiv.appendChild(newVid);
                    cardDiv.appendChild(controlDiv);
                    //put div in main-section elem
                    document.getElementById('videos').appendChild(cardDiv);
                    h.adjustVideoElemSize();

                    // if (!document.getElementById('screen-local').style.display) {
                    //     let elem = document.getElementById('toggle-video');
                    //     elem.style.backgroundColor = "#040404";
                    //     //elem.style.Color = "red";
                    //     //document.getElementById('screen-local').style.display = 'contents';
                    // }
                    h.getUserFullMedia().then((stream) => {
                        //save my stream
                        myStream = stream;
                        broadcastNewTracks(myStream, 'video');
                        let elem = document.getElementById('toggle-video');
                        if (myStream.getVideoTracks()[0].enabled) {
                            elem.style.color = "red";
                        }
                        // showw video scrren local
                        document.getElementById('screen-local').style.display = 'inline-grid';
                    }).catch((e) => {
                        console.error(`stream error: ${e}`);
                    });
                    isCalling = true;
                }
            };

            pc[partnerName].onconnectionstatechange = (d) => {
                switch (pc[partnerName].iceConnectionState) {
                    case 'disconnected':
                    case 'failed':
                        h.closeVideo(partnerName);
                        break;
                    case 'closed':
                        h.closeVideo(partnerName);
                        break;
                }
            };

            pc[partnerName].onsignalingstatechange = (d) => {
                switch (pc[partnerName].signalingState) {
                    case 'closed':
                        console.log("Signalling state is 'closed'");
                        h.closeVideo(partnerName);
                        break;
                }
            };
        }

        function shareScreen() {
            h.shareScreen().then((stream) => {
                h.toggleShareIcons(true);
                //disable the video toggle btns while sharing screen. This is to ensure clicking on the btn does not interfere with the screen sharing
                //It will be enabled was user stopped sharing screen
                h.toggleVideoBtnDisabled(true);
                //save my screen stream
                screen = stream;
                //share the new stream with all partners
                broadcastNewTracks(stream, 'video', false);
                //When the stop sharing button shown by the browser is clicked
                screen.getVideoTracks()[0].addEventListener('ended', () => {
                    stopSharingScreen();
                });
            }).catch((e) => {
                console.error(e);
            });
        }

        function stopSharingScreen() {
            //enable video toggle btn
            h.toggleVideoBtnDisabled(false);
            return new Promise((res, rej) => {
                screen.getTracks().length ? screen.getTracks().forEach(track => track.stop()) : '';
                res();
            }).then(() => {
                h.toggleShareIcons(false);
                broadcastNewTracks(myStream, 'video');
            }).catch((e) => {
                console.error(e);
            });
        }

        function broadcastNewTracks(stream, type, mirrorMode = true) {
            h.setLocalStream(stream, mirrorMode);
            let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
            for (let p in pc) {
                let pName = pc[p];
                if (typeof pc[pName] == 'object') {
                    h.replaceTrack(track, pc[pName]);
                }
            }
        }

        function toggleRecordingIcons(isRecording) {
            let e = document.getElementById('record');

            if (isRecording) {
                e.classList.add('text-primary');
                e.classList.remove('text-white');

            } else {
                e.classList.add('text-white');
                e.classList.remove('text-primary');
            }
        }

        function startRecording(stream) {
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            mediaRecorder.start(1000);
            toggleRecordingIcons(true);
            mediaRecorder.ondataavailable = function (e) {
                recordedStream.push(e.data);
            }
            mediaRecorder.onstop = function () {
                toggleRecordingIcons(false);
                h.saveRecordedStream(recordedStream, username);
                setTimeout(() => {
                    recordedStream = [];
                }, 3000);
            }

            mediaRecorder.onerror = function (e) {
                console.error(e);
            }
        }
        //When the video icon is clicked
        document.getElementById('toggle-video').addEventListener('click', (e) => {
            e.preventDefault();
            if (!myStream || !myStream.active) { // chek stream if dont have so create new
                //Get user video by default
                h.getUserFullMedia().then((stream) => {
                    //save my stream
                    myStream = stream;
                    broadcastNewTracks(myStream, 'video');

                    let elem = document.getElementById('toggle-video');
                    if (myStream.getVideoTracks()[0].enabled) {
                        //elem.style.backgroundColor = "#040404"
                        elem.style.color = "red";
                    }
                    // showw video scrren local
                    document.getElementById('screen-local').style.display = 'inline-grid';
                    socket.emit('startcall', {
                        room: room,
                        socketId: socketId,
                        username: username,
                        roomCall: room + '_call',
                    });
                    isCloseCall();
                }).catch((e) => {
                    console.error(`stream error: ${e}`);
                });
            } else { // when click for turn of call
                myStream.getTracks().forEach(track => track.stop())// stop strem
                let elem = document.getElementById('toggle-video');
                //elem.style.backgroundColor = "#040404";
                elem.style.color = "white";
                document.getElementById('screen-local').style.display = 'none';

                let cl = document.getElementsByClassName('card-sm');
                if (cl.length > 0) { // check remove screen remote
                    for (let i = cl.length - 1; i >= 0; i--) {
                        cl[i].remove();
                    }
                }
                myStream = '';
                pc = [];
                socket.emit('outcall', { username: username, roomCall: room + '_call', });
            }

        });

        //When the mute icon is clicked
        // document.getElementById('toggle-mute').addEventListener('click', (e) => {
        //     e.preventDefault();
        //     if (!myStream || !myStream.active) {
        //         //Get user audio by default
        //         h.getUserAudio().then((stream) => {
        //             //save my stream
        //             myStream = stream;
        //             broadcastNewTracks(myStream, 'audio');
        //             let elem = document.getElementById('toggle-mute');
        //             if (myStream.getAudioTracks()[0].enabled) {
        //                 elem.style.backgroundColor = "red"
        //             }
        //         }).catch((e) => {
        //             console.error(`stream error: ${e}`);
        //         });
        //     } else {
        //         myStream.getTracks().forEach(track => track.stop())
        //         let elem = document.getElementById('toggle-mute');
        //         elem.style.backgroundColor = "007bff";
        //     }
        // });

        //When user clicks the 'Share screen' button
        document.getElementById('share-screen').addEventListener('click', (e) => {
            e.preventDefault();
            if (screen && screen.getVideoTracks().length && screen.getVideoTracks()[0].readyState != 'ended') {
                stopSharingScreen();
            } else {
                shareScreen();
            }
        });


        //When record button is clicked
        document.getElementById('record').addEventListener('click', (e) => {
            /**
             * Ask user what they want to record.
             * Get the stream based on selection and start recording
             */
            if (!mediaRecorder || mediaRecorder.state == 'inactive') {
                h.toggleModal('recording-options-modal', true);
            } else if (mediaRecorder.state == 'paused') {
                mediaRecorder.resume();
            } else if (mediaRecorder.state == 'recording') {
                mediaRecorder.stop();
            }
        });


        //When user choose to record screen
        document.getElementById('record-screen').addEventListener('click', () => {
            h.toggleModal('recording-options-modal', false);

            if (screen && screen.getVideoTracks().length) {
                startRecording(screen);
            } else {
                h.shareScreen().then((screenStream) => {
                    startRecording(screenStream);
                }).catch(() => { });
            }
        });


        //When user choose to record own video
        document.getElementById('record-video').addEventListener('click', () => {
            h.toggleModal('recording-options-modal', false);

            if (myStream && myStream.getTracks().length) {
                startRecording(myStream);
            } else {
                h.getUserFullMedia().then((videoStream) => {
                    startRecording(videoStream);
                }).catch(() => { });
            }
        });


        //When camera-local-video icon is clicked
        document.getElementById('camera-local-video').addEventListener('click', (e) => {
            e.preventDefault();
            if (myStream.getVideoTracks()[0].enabled) {
                e.target.classList.remove('fa-video');
                e.target.classList.add('fa-video-slash');
                myStream.getVideoTracks()[0].enabled = false;
            } else {
                e.target.classList.remove('fa-video-slash');
                e.target.classList.add('fa-video');
                myStream.getVideoTracks()[0].enabled = true;
            }
            broadcastNewTracks(myStream, 'video');
        });
        // on - off audio
        document.getElementById('mute-remote-mic').addEventListener('click', (e) => {
            e.preventDefault();
            if (myStream.getAudioTracks()[0].enabled) {
                e.target.classList.add('fa-microphone-slash');
                e.target.classList.remove('fa-microphone');
                myStream.getAudioTracks()[0].enabled = false;
            } else {
                e.target.classList.add('fa-microphone');
                e.target.classList.remove('fa-microphone-slash');
                myStream.getAudioTracks()[0].enabled = true;
            }
            broadcastNewTracks(myStream, 'audio');
        });


        //When user confirm call video
        document.getElementById('confirm-video').addEventListener('click', () => {
            h.toggleModal('confirm-options-modal', false);
            audio.pause();
            clearInterval(interval);
            socket.emit('new user', {
                // room: room + '_call',
                roomCall: room + '_call',
                socketId: socketId
            });

        });
        //When user confirm call video
        document.getElementById('cancel-video').addEventListener('click', () => {
            h.toggleModal('confirm-options-modal', false);
            audio.pause();
            clearInterval(interval);
        });
        function isCloseCall() {
            setTimeout(function () {
                if (!isCalling) {
                    myStream && myStream.getTracks().forEach(track => track.stop())// stop strem
                    let elem = document.getElementById('toggle-video');
                    //elem.style.backgroundColor = "#040404";
                    elem.style.color = "white";
                    document.getElementById('screen-local').style.display = 'none';
                    pc = [];
                    myStream = '';
                    audio.pause();
                    if (interval)
                        clearInterval(interval);
                    socket.emit('closetcall', { username: username, room: room });
                }
            }, 10000);

        }
    }
});