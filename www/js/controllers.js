angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $LocalStorage, $ionicPopup) {

        var settings = null;
        var session = null;
        var phone = null;
        $scope.onCall = false;
        $scope.registered = false;
        // $scope.phoneNumber = '1002';
        // $scope.phoneNumber = '8018892666';
        $scope.phoneNumber = '8003733411';
        

        var resgisterDisplayed = false;



        $scope.$on('$ionicView.enter', function () {
            saved_settings = $LocalStorage.getObject('settings');
            if (Object.keys(saved_settings).length > 0) {
                settings = saved_settings;
            }
            $scope.registered = false;
        });

        $scope.register = function () {

            var configuration = {
                'ws_servers': settings.server,
                'uri': settings.user,
                'password': settings.password,
                stunServers: ["stun.l.google.com:19302", "stun1.l.google.com:19302"]
            };

            phone = new SIP.UA(configuration);

            phone.on('connected', function (e) {
                console.log('Connected to the server');
                //var alertPopup = $ionicPopup.alert({
                //    title: 'Connected to server!'
                //});
            });

            phone.on('disconnected', function (e) {
                console.log('Disconnected from the server')
            });

            phone.on('registered', function (e) {

                console.log('Successfully registered with the server.');
                //if (!resgisterDisplayed) {
                    resgisterDisplayed = true;
                    $scope.registered = true;
                    var alertPopup = $ionicPopup.alert({
                        title: 'Device Registered!'
                    });
                //}


            });

            phone.start();
        }

        $scope.callPhone = function (phoneNumber) {

            //var session = null;

            var selfView = document.getElementById('my-video');
            var remoteView = document.getElementById('their-video');

            // Register callbacks to desired call events
            var eventHandlers = {
                'progress': function (e) {
                    console.log("Call Progress update");
                },
                'failed': function (e) {
                    console.log("Call Failed");
                    console.log(e);
                },
                'confirmed': function (e) {
                    // Attach local stream to selfView
                    console.log("Call Placed successfully");
                    console.log("\n.\n.\n.\n.\n.\n.\n.\n.\n.");
                    selfView.src = window.URL.createObjectURL(session.connection.getLocalStreams()[0]);
                },
                'ended': function (e) {
                    console.log("Call Ended");
                }
            };

            var options = {
                'eventHandlers': eventHandlers,
                'extraHeaders': [],
                'sessionTimersExpires': 180,
                media: {
                    constraints: {
                        audio: true,
                        video: false
                    },
                    render: {
                        remote: {
                            video: remoteView
                        },
                        local: {
                            video: 'my-video'
                        }
                    }
                }
            };

            console.log('Now Calling: ', phoneNumber);
            //AudioToggle.setAudioMode(AudioToggle.EARPIECE);
            session = phone.invite(phoneNumber, options);
            session.mediaHandler.on('addStream', function (event) {
                remoteView.src = window.URL.createObjectURL(event.stream);
            });
            session.on('bye', function () {
                try {
                    $scope.$apply(function () {
                        $scope.onCall = false;
                    });
                }
                catch (err) {

                }
                //AudioToggle.setAudioMode(AudioToggle.SPEAKER);
                session = null;

            });

            $scope.onCall = true;
        }


        $scope.endCall = function () {
            if (session) {
                if ($scope.onCall){
                    session.bye();
                }
                
                else{
                    session.cencel();
                }
            }
            session = null;
            $scope.onCall = false;
        }

    })

    .controller('SettingsCtrl', function ($scope, $LocalStorage, $state) {
        $scope.settings = {
            server: 'ws://209.41.90.202:5066',
            user: 'sip:200@209.41.90.202',
            password: 'C92507058214'
        };



        //  $scope.settings = {
        //     server: 'ws://10.0.0.111:5066',
        //     user: 'sip:200@10.0.0.111',
        //     password: 'C92507058214'
        // };

        $scope.$on('$ionicView.enter', function () {
            saved_settings = $LocalStorage.getObject('settings');
            if (Object.keys(saved_settings).length > 0) {
                $scope.settings = saved_settings;
            }
            else {
                $scope.save();
            }
        });


        $scope.save = function () {
            $LocalStorage.setObject('settings', $scope.settings);

            $state.go('tab.dash');
        }

    });
