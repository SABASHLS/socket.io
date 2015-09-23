var app = angular.module('chatApp', []);
//controller start
app.controller('Ctrlchat', function ($scope, $http, $timeout) {
    //get function start here
    $http.get('/myinfo').success(function (data) {
        //global variables define here
        var socket = io("http://59.92.109.93:2222/");
        var online = []
        var test = data.email;
        var busy = false;
        var conferenceJoined = false;
        var refresh;
        var pc,videostream;
        //media constraints start here
        var mediaConstraints = {
            'mandatory': {
                'OfferToReceiveAudio': true,
                'OfferToReceiveVideo': true,

            }
        };

        //iceserver are define here
        var pc_config = {
            'iceServers': [/*{
                'urls': 'stun:stun.services.mozilla.com'
                        }, {
                'urls': 'stun:stun.l.google.com:19302'
                        },*/{
                "url":"turn:sabash@59.92.109.93:3478","credential":"sabash"}]
        };
var TURN = {
    url: 'turn:homeo@turn.bistri.com:80',
    credential: 'homeo'
};
        //this is starting of the socket connection here
        socket.on("connect", function () {
            window.conferenceJoined = true;
            window.busy = false;
            
            
            socket.emit('myinfo', {
                email: data.email
            });
            //online user function here
            socket.on("online", function (users) {
                online = [];
                angular.forEach(users, function (k, v) {

                    if (data.email == v) {
                        //nothing to here
                    } else {
                        online.push(v)
                    }
                })
                $scope.$apply(function () {
                    $scope.onusers = online;
                });
            })
        });

        $scope.msg = [];
        //online user click and strat communication here
        $scope.test = function (e) {
            pc = new RTCPeerConnection(pc_config);
            pc.onaddstream = function (stream) {
                var source = document.getElementById('video');
                source.src = URL.createObjectURL(stream.stream);

            }
            
            if(window.busy)
            {
                alert('your alreay in one call');
            }
            else
            {
            window.to = e;
            window.from = data.email;
            $scope.msg = [];
            $scope.user = e;
            socket.emit('trying', {
                from: window.from,
                to: window.to
            })
            onbeforeunload({
                from: window.to,
                to: window.from
            })
            }
        }
        
        socket.on('trying', function (data) {
            console.log(window.busy);
            if (window.busy) {
                socket.emit('busy', {
                    from: data.from,
                    to: data.to
                })
            } else {
                $scope.$apply(function () {
                    $scope.acpt = true;
                    $scope.decln = true;
                    accept(data)
                    decline(data)
                    timeout(data)
                    cutcall(data)
                    onbeforeunload(data)
                })
            }
        })

        socket.on('decline', function (data) {
            $scope.$apply(function () {
                window.conferenceJoined = false;
            })
            alert('user decline the call')

        })

        socket.on('accept', function (data) {
            $scope.$apply(function () {
                $scope.cutcal = true;

                cutcall({
                    from: data.to,
                    to: data.from
                })
                offer(data)
            })
        })
         //timeout on method started here
        socket.on('timeout', function (data) {
            alert('user not attent the call')
        })
         //cutcall on method started here
        socket.on('cutcall', function (data) {
            $timeout.cancel(window.timer);
            $scope.$apply(function () {
                window.localstream.stop();
                 pc.removeStream(videostream)
                $scope.cutcal = false;
                $scope.source = false;
                $scope.video = false;
                window.busy = false;
                window.conferenceJoined = false;
                stream();
            })
            alert('Your call is declied')
        })
        //user busy on method started here
        socket.on('busy', function (data) {
            alert('user is now busy&call later')

        })
         //webcam and micro phone block on method started here
        socket.on('block', function (data) {
            $scope.$apply(function () {
                $scope.cutcal = false;
            })
            block(data)

        })
        //page refresh function on 
        socket.on('refresh', function (data) {
            window.conferenceJoined = data.conferenceJoined;
            $timeout.cancel(window.timer);
            $scope.$apply(function () {
                window.localstream.stop();
                $scope.acpt = false;
                $scope.decln = false;
                $scope.cutcal = false;
                $scope.source = false;
                $scope.video = false;
                window.busy = false;
                 window.conferenceJoined = false;
            })
            alert('refresh')

        })
         //webrtc meg on method  started here
        socket.on('webrtc-msg', function (data) {
            console.log(data)
            if (data) {
                if (data.offer) {
                    answer(data)
                } else if (data.answer) {

                    pc.setRemoteDescription((new RTCSessionDescription(data.answer)));
                } else if (data.candidates) {
                  
                    pc.addIceCandidate(new RTCIceCandidate(data.candidates));

                }
            }
        });


        /*------functions started here------*/
        
         // Decline function started here
        function decline(email) {
            $scope.decline = function () {
                $timeout.cancel(window.timer);
                $scope.acpt = false;
                $scope.decln = false;
                socket.emit('decline', email)
                window.conferenceJoined = false;
            }
        }
         // Accept function started here
        function accept(email) {
            $scope.accept = function () {
                pc = new RTCPeerConnection(pc_config);
            pc.onaddstream = function (stream) {
                var source = document.getElementById('video');
                source.src = URL.createObjectURL(stream.stream);

            }
                $timeout.cancel(window.timer);
                $scope.acpt = false;
                $scope.decln = false;
                $scope.cutcal = true;
                $scope.source = true;
                $scope.video = true;
                socket.emit('accept', email)
            }
        }

         //Cutcall function started here
        function cutcall(email) {
            $scope.cutcall = function () {
                $timeout.cancel(window.timer);
                window.localstream.stop();
                pc.removeStream(videostream)
                $scope.source = false;
                $scope.video = false;
                $scope.cutcal = false;
                window.busy = false;
                window.conferenceJoined = false;
                stream();
                socket.emit('cutcall', email);

            }
        }
         //webcam and micropone block function started here
        function block(email) {
            $scope.$apply(function () {
                window.localstream.stop();
                $scope.source = false;
                $scope.video = false;
                $scope.cutcal = false;
                window.busy = false;
                window.conferenceJoined = false;
            })
            alert('your call is bolcked');
        }
         //stream and peer connection closing function started here
        function stream() {
            var source = document.getElementById('source');
            source.src = null;
            var video = document.getElementById('video');
            video.src = null;
            pc.close();
        }

         //timeout function started here
        function timeout(email) {
            window.timer = $timeout(function () {
                $scope.acpt = false;
                $scope.decln = false;
                socket.emit('timeout', email)
            }, 35000);
        }
         //Page refresh function started here
        function onbeforeunload(email) {
            window.onbeforeunload = function () {
                if (window.conferenceJoined) {
                    socket.emit('refresh', {
                        from: email.from,
                        to: email.to,
                        conferenceJoined: false
                    });
                    window.conferenceJoined = false;
                }
            };
        }

         //caller offer create function started here
        function offer(email) {
             window.busy = true;
            getUserMedia({
                audio: true,
                video: true
            }, function (stream) {
                var source = document.getElementById('source');
                source.src = URL.createObjectURL(stream);
                window.localstream = stream;
                videostream = stream;
                pc.addStream(stream);
                pc.createOffer(function (offer) {
                    pc.setLocalDescription(offer);
                    socket.emit('webrtc', {
                        offer: offer,
                        from: email.from,
                        to: email.to
                    });
                }, function (err) {
                    console.log('error')
                }, mediaConstraints);

                pc.onicecandidate = function (candidate) {
                    // candidate.candidate['email']=e;
                    var candidates = candidate.candidate;

                    socket.emit('webrtc', {
                        candidates: candidates,
                        from: email.from,
                        to: email.to
                    });
                };

            }, function (err) {
                if (err) {
                    alert('your camera and microphone is off please access them')
                    $scope.$apply(function () {
                        $scope.cutcal = false;
                        socket.emit('block', {
                            from: email.to,
                            to: email.from
                        })
                    });

                }
            });
            $scope.source = true;
            $scope.video = true;
        }

         //callee answer create function started here
        function answer(email) {
                window.busy = true;  
                window.conferenceJoined = true;
            pc.setRemoteDescription((new RTCSessionDescription(email.offer)));
            getUserMedia({
                audio: true,
                video: true
            }, function (stream) {
                var source = document.getElementById('source');
                source.src = URL.createObjectURL(stream);
                window.localstream = stream;
                 videostream = stream;
                pc.addStream(stream);
              
                pc.createAnswer(function (answer) {
                        pc.setLocalDescription(answer, function () {

                                socket.emit('webrtc', {
                                    answer: answer,
                                    from: email.to,
                                    to: email.from
                                });
                            },
                            function (err) {}, mediaConstraints);
                    },
                    function (err) {
                        console.log(err);
                    });
                pc.onicecandidate = function (candidate) {

                    var candidates = candidate.candidate;
                    socket.emit('webrtc', {
                        candidates: candidates,
                        from: email.to,
                        to: email.from

                    });
                };

            }, function (err) {
                if (err) {
                    window.conferenceJoined = false;
                    $scope.$apply(function () {
                        $scope.source = false;
                        $scope.video = false;
                        $scope.cutcal = false;
                        window.busy = false;
                        window.localstream.stop()
                        
                    })
                    socket.emit('block', {
                        from: email.from,
                        to: email.to
                    })
                }
            });
            // relaod the page in call process function here
        }

    });
})
