/*var socket = io("http://localhost:3000");

socket.on("server-send-dki-thatbai", function(){
    alert("Username da ton tai!!!");
});

socket.on("server-send-dki-thanhcong", function(data){
    $("#currentUser").html(data);
    $("#loginForm").hide(2000);
    $("#chatForm").show(1000);
});

socket.on("server-send-danhsach-Users", function(data){
    $("#boxContent").html("");
    data.forEach(function(i){
        $("#boxContent").append("<div class='user'>"+i+"</div>");
    })
});

socket.on("server-send-message", function(data){
    $("#listMessages").append("<div class='ms'>"+data.un+": "+data.nd+"</div>");
});

socket.on("ai-do-dang-go-chu", function(data){
    $("#thongbao").html(data+ "<img width='20px' src='https://cdn.dribbble.com/users/8424/screenshots/1036999/dots_2.gif'>");
});
socket.on("ai-do-stop-go-chu", function(){
    $("#thongbao").html("");
});

socket.on("server-send-rooms",function(data){
    $("#dsRoom").html("");
    data.map(function(r){
        $("#dsRoom").append("<h4 class='room'>"+r+"</h4");
    });
});

socket.on("server-send-room-socket",function(data){
    $("#roomHienTai").html(data);
})
$(document).ready(function(){
    $("#btnRegister").click(function(){
        socket.emit("client-send-Username",$("#txtUsername").val());
    });

    $("#btnLogout").click(function(){
        socket.emit("logout");
        $("#loginForm").show(2000);
        $("#chatForm").hide(1000);
    });
    $("#btnSendMessage").click(function(){
        socket.emit("user-send-message", $("#txtMessage").val());
        
    });

    $("#txtMessage").focusin(function(){
        socket.emit("toi-dang-go-chu");
    });
    $("#txtMessage").focusout(function(){
        socket.emit("toi-stop-go-chu");
    });

    $('#btnTaoRoom').click(function(){
        socket.emit("tao-room",$('#txtRoom').val());
    });
});*/

//io_client = require("socket.io-client");
//var socket = io_client("http://localhost:3000");
//var Roomcontroller = require('../controllers/room.controller');
var socket = io();

socket.on('server-send-user-join-room', function(data){
    console.log(data, ' join room');
    
});

socket.on('server-send-message', function(data){
    
    if(data.room==$('#id-currRoom').text()){
       
        var eachmess = '<div class="each-mess"><img src="/uploads/man-clipart-png-8.png" alt=""><div class="each-content"><div class="user-time">'
                       +'<div class="user-send">'+data.message.nameUser+'</div><div class="time" style="font-size: 10px">'+data.message.time+'</div>'
                       +'</div><div class="ms">'+data.message.text+'</div></div>'
                       +'<div class="liked"></div></div>';      
        $("#listMessages").append(eachmess);
        $('#listMessages').animate({
            scrollTop: $('#listMessages').get(0).scrollHeight
        },1);
        
    }
    else{
        var count = $(".txtNotice").html();
        count = parseInt(count)+1;
        $(".txtNotice").html(count+"");
        $('#div-notices p').hide();
        var notice= "<a href='/rooms/"+data.room+"' class='one-notice'>"
            +"<span style='font-weight:bold'>"+data.message.nameUser+"</span><span> vừa đăng một bài viết trong </span>"
            +"<span style='font-weight:bold'>"+data.roomName+"</span>"
        +"</a>";
        $("#div-notices").prepend(notice);
    }
    
});

function ajaxAdd(){
    $.ajax({
        type : "POST",
        url : "/rooms/addUser",
        data : {
            roomId:  $('#div-curRoom p').html(),
            email: $('#search').val()
        },
        success: function(result){
            $('#notice-add-user').text(result)
            $('#notice-add-user').show()
            $('#notice-add-user').hide(3000)
          //alert("Success: "+ result.length);
        },
        error : function(e) {
            $('#notice-add-user').text(result)
            $('#notice-add-user').show()
            $('#notice-add-user').hide(3000)
        }
      });  
}
function ajaxSearch(){
    if($('#search').val()!=""){
        $('#searchForm').show();
        $.ajax({
            type : "POST",
            url : "/rooms/search",
            data : {
                //roomId:  $('#div-curRoom p').html(),
                text: $('#search').val()
            },
            success: function(result){
              for(var u in result){
                var one= '<div class="one">'
                            +'<div class="left-one">'
                                +'<div class="one-user">'+result[u].name+'</div>'
                                +'<div class="one-email">'+result[u].email+'</div>'
                            +'</div>'
                            //+'<button class="right-one" id='+result[u]._id+'>' +"Add"+'</button>'
                         +'</div>';
                $('#searchForm').append(one);
              }
              //alert("Success: "+ result.length);
            },
            error : function(e) {
              console.log("ERROR: ", e);
            }
          });  
    }
    else{
        $('#searchForm').hide();
    } 
}
function ajaxUpfile(){
    $.ajax({
        type: "POST",
        url: "/uploadfiles",
        data: $('#inp-file')[0].files[0],
        //contentType: false,
        success: function(result){
            alert(result);
        },
        error : function(e) {
            console.log("ERROR: ", e);
          } 
    });
}
function ajaxOut(){
    $.ajax({
      type : "POST",
      url : "/rooms/out",
      data : {
        roomId:  $('#div-curRoom p').html()
      },
      success: function(result){
        window.location.replace(window.location.protocol + "//" + window.location.host + result);
        
      },
      error : function(e) {
        console.log("ERROR: ", e);
      }
    });  
  }

$(document).ready(function(){
    $('#listMessages').animate({
        scrollTop: $('#listMessages').get(0).scrollHeight
    },1);
    $('#btnSendMessage').click(function(){
        if($('#txtMessage').val()!=""){
            messObj={
                text: $('#txtMessage').val(),
                nameUser: $('#nameUser').val(),
                time: new Date(Date.now()).toLocaleString(),
                roomName: $('#currentRoom').html(),
                room: $('#id-currRoom').text()
            }
            $('#txtMessage').val("");
            socket.emit("user-send-message",messObj);
        }
        
    });
    $('#btn-online').click(function(){
        $('#btn-online').css({"background-color":"azure"});
        $('#btn-files').css("background-color","turquoise");
        //ajaxGet();
    });
    $('#btn-files').click(function(){
        $('#btn-online').css("background-color","turquoise");
        $('#btn-files').css({"background-color":"azure"});
    })
    $('#notice').click(function(){
        $(".txtNotice").html("0")
        $('#div-notices').toggle(100);
        
    })
    $('#search').keyup(function(e){
        $('#searchForm').html("");
        ajaxSearch();
        if(e.keyCode == 13)
        {
            ajaxAdd();
        }
    })
    $('#submitfile').click(function(){
        alert($('#inp-file')[0].files[0]);
        ajaxUpfile();
    })

    $('#out-group').click(function(){
        $('#are-you-sure').show(100);
    });
    $('#are-you-sure .yes').click(function(){
        $('#are-you-sure').hide();
        ajaxOut();
    });
    $('#are-you-sure .no').click(function(){
        $('#are-you-sure').hide();
    });
});
