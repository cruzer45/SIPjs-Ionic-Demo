angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $LocalStorage, $ionicPopup) {
        var settings = null;
        var session = null;
        var phone = null;
        $scope.onCall = false;
        $scope.registered = false;
        $scope.phoneNumber = '1005';


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
                'password': settings.password
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
                $scope.registered = true;
                var alertPopup = $ionicPopup.alert({
                    title: 'Device Registered!'
                });
            });

            phone.start()

        }

        $scope.callPhone = function () {

            //AudioToggle.setAudioMode(AudioToggle.EARPIECE);

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

            session = phone.invite($scope.phoneNumber, options);
            session.mediaHandler.on('addStream', function (event) {
                remoteView.src = window.URL.createObjectURL(event.stream);
            });

            session.on('bye', function () {
                $scope.onCall = false;
                session = null;
            });

            $scope.onCall = true;
        }


        $scope.endCall = function () {
            session.bye();
            session = null;
            $scope.onCall = false;
        }

    })

    .controller('SettingsCtrl', function ($scope, $LocalStorage, $state) {
        $scope.settings = {
            server: 'ws://10.19.10.234:5066asdfasdfasd',
            user: 'sip:1003@10.19.10.234',
            password: '1234'
        };

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
