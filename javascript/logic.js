var Wins = 0;
var Losses = 0;
var Ties = 0;

var config = {
    apiKey: "AIzaSyAmqOqNGPGxknuE7b5sj_iy6a1OCGvKMrM",
    authDomain: "trytwo-6f07c.firebaseapp.com",
    databaseURL: "https://trytwo-6f07c.firebaseio.com",
    projectId: "trytwo-6f07c",
    storageBucket: "trytwo-6f07c.appspot.com",
    messagingSenderId: "692442265658"
};
firebase.initializeApp(config);
var database = firebase.database();

if (localStorage.getItem("User") == null) {
    firstSignIn();
}
else {
    startListening();
}


function firstSignIn() {
    firebase.auth().signInAnonymously().then(function () {
        var user = firebase.auth().currentUser;
        localStorage.setItem("User", user.uid);
        database.ref(user.uid).set({ Wins: 0, Losses: 0, Ties: 0 });
        Wins = Losses = Ties = 0;
        startListening();
    });
}

function startListening() {
    database.ref(localStorage.getItem("User")).on('value', function (snapshot) {

        if (!snapshot.exists()) {
            firstSignIn();
        }
        else {
            Wins = snapshot.val().Wins;
            Losses = snapshot.val().Losses;
            Ties = snapshot.val().Ties;
        }
        $('#wins-display').text(Wins);
        $('#losses-display').text(Losses);
        $('#ties-display').text(Ties);
    })
}

database.ref('Logic').on('value', function (snap) {
    if (snap.val().choice1 != null && snap.val().choice2 != null && !snap.val().GameFinished ) 
    {
        database.ref('Logic').update({ 'choice1': null, 'choice2': null, 'GameFinished': true});
        $(".p1").removeClass("fa-spinner fa-spin").addClass("fa-hand-" + snap.val().choice1);
        $(".p2").removeClass("fa-spinner fa-spin").addClass("fa-hand-" + snap.val().choice2);

        if (snap.val().playerOne == localStorage.getItem("User")) {
            if (snap.val().choice1 == 'rock' && snap.val().choice2 == 'scissors') {
                Wins++;
            }
            else if (snap.val().choice1 == 'scissors' && snap.val().choice2 == 'paper') {
                Wins++;
            }
            else if (snap.val().choice1 == 'paper' && snap.val().choice2 == 'rock') {
                Wins++;
            }
            else if (snap.val().choice1 == 'paper' && snap.val().choice2 == 'paper') {
                Ties++;
            }
            else if (snap.val().choice1 == 'rock' && snap.val().choice2 == 'rock') {
                Ties++;
            }
            else if (snap.val().choice1 == 'scissors' && snap.val().choice2 == 'scissors') {
                Ties++;
            }
            else {
                Losses++;
            }
        }
        if (snap.val().playerTwo == localStorage.getItem("User")) {
            if (snap.val().choice2 == 'rock' && snap.val().choice1 == 'scissors') {
                Wins++;
            }
            else if (snap.val().choice2 == 'scissors' && snap.val().choice1 == 'paper') {
                Wins++;
            }
            else if (snap.val().choice2 == 'paper' && snap.val().choice1 == 'rock') {
                Wins++;
            }
            else if (snap.val().choice2 == 'paper' && snap.val().choice1 == 'paper') {
                Ties++;
            }
            else if (snap.val().choice2 == 'rock' && snap.val().choice1 == 'rock') {
                Ties++;
            }
            else if (snap.val().choice2 == 'scissors' && snap.val().choice1 == 'scissors') {
                Ties++;
            }
            else {
                Losses++;
            }
        }
        setTimeout(() => {
            $(".p1").addClass("fa-spinner fa-spin").removeClass("fa-hand-scissors fa-hand-paper fa-hand-rock")
            $(".p2").addClass("fa-spinner fa-spin").removeClass("fa-hand-scissors fa-hand-paper fa-hand-rock")
            database.ref(localStorage.getItem('User')).set({ Wins: Wins, Losses: Losses, Ties: Ties });
            database.ref('Logic').update({ 'GameFinished' : false });
        }, 2000);
    }
})

$('.join').on("click", function () {
    $this = $(this);
    database.ref('Logic').once('value').then(function (snap) {

        if (snap.val().playerOne == localStorage.getItem('User')) {
            alert("You are already playing as player one!");
        }
        else if (snap.val().playerTwo == localStorage.getItem('User')) {
            alert("You are already playing as player two!");
        }
        else {
            if ($this.attr('id') == 'p1-button') {
                if (snap.val().playerOneTimeout < moment() - 100000 || snap.val().playerOneTimeout == null) {
                    //Player one has been inactive. Let the user join
                    database.ref('Logic').update({ 'playerOne' : localStorage.getItem('User'), 'playerOneTimeout' : +moment(), 'choice1' : null });
                }
                else {
                    alert("Someone else is playing as player one!");
                }
            }
            if ($this.attr('id') == 'p2-button') {
                if (snap.val().playerTwoTimeout < moment() - 100000 || snap.val().playerTwoTimeout == null) {
                    //Player one has been inactive. Let the user join
                    database.ref('Logic').update({ 'playerTwo': localStorage.getItem('User'), 'playerTwoTimeout': +moment(), 'choice2': null });
                }
                else {
                    alert("Someone else is playing as player Two!");
                }
            }
        }
    });
})

$('.choice').on("click", function () {
    $this = $(this);
    database.ref('Logic').once('value').then(function (snap) {

        if (!snap.val().GameFinished) {
            if (snap.val().playerOne == localStorage.getItem('User')) {
                if (snap.val().choice1 == null) {
                    $(".p1").removeClass("fa-spinner fa-spin").addClass("fa-hand-" + $this.attr('id'));
                    database.ref('Logic').update({ 'choice1': $this.attr('id') });
                }
                else {
                    alert("You have already selected a choice!");
                }
            }
            else if (snap.val().playerTwo == localStorage.getItem('User')) {
                if (snap.val().choice2 == null) {
                    $(".p2").removeClass("fa-spinner fa-spin").addClass("fa-hand-" + $this.attr('id'));
                    database.ref('Logic').update({ 'choice2': $this.attr('id') });
                }
                else {
                    alert("You have already selected a choice!");
                }
            }
            else {
                alert("Select a player!")
            }
        }
    })
})
var first = true;
var lastChatTime = 0;
database.ref("Chat").on("value", function (snap) {
    if (first) {
        snap.forEach(element => {
            var temp = $('<p>');
            temp.addClass("card-text");
            temp.text(element.val().User + ": " + element.val().Message);
            temp.appendTo($('#temp'));
            first = false;

            if (lastChatTime < element.val().Timer) {
                lastChatTime = element.val().Timer;
            }
        });
    }
    else {
        snap.forEach(element => {
            if (lastChatTime < element.val().Timer) 
            {
                lastChatTime = element.val().Timer;

                var temp = $('<p>');
                temp.addClass("card-text");
                temp.text(element.val().User + ": " + element.val().Message);
                temp.appendTo($('#temp'));
            }
        })
    }
    scrollChat();
})

$('#comment').bind("enterKey", function (e) {
    database.ref("Chat").child("Message:" + moment()).set({ User: localStorage.getItem('User'), Message: $('#comment').val(), Timer: +moment() });

    $('#comment').val("");
});
$('#comment').keyup(function (e) {
    if (e.keyCode == 13) {
        $(this).trigger("enterKey");
    }
});

function scrollChat(){
    $('#temp').stop().animate({
        scrollTop: $('#temp')[0].scrollHeight
    }, 800);
}