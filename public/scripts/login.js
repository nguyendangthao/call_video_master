var socket = io('localhost:3000/');

$(document).ready(function(){
  $('#btnLogin').click(function(){
    //alert('Login');
    socket.emit("client-login", $('#email').val());//,$("#txtUsername").val());
  });
});