const randomUserNames = [
    'StarryEyes123',
    'QuantumSoul',
    'ElectricDreamer',
    'RainbowNinja42',
    'LunaWhisperer',
    'MysticJourney',
    'PixelPioneer',
    'MidnightRider',
    'CosmicExplorer',
    'SerendipitySeeker',
    'SolarFlare87',
    'VelvetThunder',
    'EnigmaChaser',
    'AuroraBorealis',
    'TechnoNomad',
    'JazzMaverick',
    'CrystalGazer',
    'NebulaWanderer',
    'CyberspaceVoyager',
    'VelvetVortex',
    'EchoHarmony',
    'QuantumQuasar',
    'StarryNightOwl',
    'LunarExplorerX',
    'NebulaNomad',
    'TimelessTraveler',
    'ElectroPulse',
    'CrystalSerpent',
    'SereneJourneyman',
    'PhoenixWhisper',
    'SynthWaveSurfer',
    'DreamCatcher42',
    'AstralWanderlust',
    'NeonNebula',
    'GalaxyGlider',
    'SolarSculptor',
    'CelestialNomad',
    'VelvetVoyage',
    'EtherealSeeker',
    'MysticMosaic'
];
const msgInput = $('#message-input');
const sendMsgBtn = $("#message-send-btn");
const messageForm = $("#messageForm");
const inputUserName = $("#inputUsername");
const randomUsernameBtn = $("#randomUsername");
const saveUsernameBtn = $("#saveUsername");
const changeUsernameBtn = $("#changeUsernameBtn");
const setUsernameModal = $("#setUsernameModal");
const messagesArea = $("#messagesArea");
const headerName = $("#headerName");
let thisUser;
let socket;
$(function () {
    randomUsernameBtn.click(function () {
        newUserName = getRandomName();
        inputUserName.val(newUserName);
    })

    function getRandomName(){
        let randomIndex = Math.floor(Math.random() * randomUserNames.length)
        let newUserName = randomUserNames[randomIndex];
        return newUserName;
    }

    saveUsernameBtn.click(function () {
        let username = inputUserName.val();
        if (username != '') {
            if(thisUser){
                emitAnnouncement('changeName', username, thisUser);
            }else{
                emitAnnouncement('newUser', username);
            }
            setUserName(username);
            setUsernameModal.modal('hide');
        }
    })

    changeUsernameBtn.click(function(){
        setUsernameModal.modal('show')
    })

    setUsernameModal.on('hidden.bs.modal', function(){
        if(!thisUser){
            let name = getRandomName();
            emitAnnouncement('newUser', username);
            setUserName(name);
        }
    });

    let savedUser = getUserCookie();
    if(!savedUser){
        setUsernameModal.modal('show');
    }else{
        setUserName(savedUser);
    }

    socket = io(); // send out connection request to server

    socket.on('connect', () => {
        loadFromLocalStorage();
    })

    socket.on('newMessage', function (message) {
        saveToLocalStorage(message);
        appendMessage(message);
        messagesArea.animate({scrollTop: messagesArea.prop("scrollHeight")});

    })

    socket.on('newAnnouncement', function(message){
        appendAnnouncement(message);
    })

    socket.on('disconnect', () => console.log("Disconnected from server"))
    
    sendMsgBtn.on('click', function () {
        const message = msgInput.val();
        if (message != '') {
            socket.emit('newMessage', {
                user: thisUser,
                text: message
            }, function (acknowledgement) {
                if (acknowledgement == 'success') {
                    msgInput.val('');
                } else {
                    alert('Could not send message! Try again.')
                }
            })
        }
    })

});

messageForm.on('submit', (e) => e.preventDefault() );

function appendMessage(message) {
    const user = message.user;
    const text = message.text;
    let messageClass = "left-msg";
    if (user == thisUser) { // change this with id
        messageClass = "right-msg";
    }
    html = `<div class="msg ${messageClass}">
                <div class="msg-bubble">
                    <div class="msg-info">
                        <div class="msg-info-name">${user}</div>
                        <!-- <div class="msg-info-time">12:46</div> -->
                    </div>
                    <div class="msg-text">
                        ${text}
                    </div>
                </div>
            </div>`;
    messagesArea.append(html);
}

function appendAnnouncement(message){
    let html = `<div class="announcement"><p>${message}</p></div>`;
    messagesArea.append(html);
}

function setUserName(username){
    thisUser = username;
    setUserCookie(username);
    headerName.html(thisUser);
}

function setUserCookie(cvalue, exdays = 30) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = "user=" + cvalue + ";" + expires + ";path=/";
}

function getUserCookie() {
    let name = "user=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function saveToLocalStorage(message){
    var existingMsg = localStorage.getItem('msg');
    var msgsObj = (existingMsg != null) ? JSON.parse(existingMsg) : [];
    msgsObj.push(message);
    msgsObj = JSON.stringify(msgsObj);
    localStorage.setItem('msg', msgsObj);
}

function loadFromLocalStorage(){
    var existingMsg = localStorage.getItem('msg');
    var msgsObj = (existingMsg != null) ? JSON.parse(existingMsg) : {};
    if (Object.keys(msgsObj).length > 0) {
        msgsObj.map(function(message){
            appendMessage(message);
        });
    }
}
function emitAnnouncement(type, value, updatedFrom = null){
    let data = {
        type: type,
        value: value
    }
    if(updatedFrom){
        data.prev = updatedFrom;
    }
    socket.emit('newAnnouncement', data);
}