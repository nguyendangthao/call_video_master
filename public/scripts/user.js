var socket = io('/rooms');

socket.on('server-send-user-join-room', function(data){
    console.log(data, ' join room');
    
});

function ajaxSearchRoom(){
    if($('#inputSearch').val()!=""){
        $.ajax({
            type : "POST",
            url : "/users/search",
            data : {
                text: $('#inputSearch').val()
            },
            success: function(result){
                $('#list-rooms a').hide();
                for(var u in result){
                //var one= '<div class="one-room">'
                //         +'<div class="name-one-room">'+result[u].name+'</div>'
                //         +'</div>';
                //$('#search-room').append(one);
                    var id = '#'+result[u]._id +'';
                    $(id).show(10);
                }
              //alert("Success: "+ result.length);
            },
            error : function(e) {
              console.log("ERROR: ", e);
            }
          });  
    }
    else{
        $('#list-rooms a').show();
    } 
}
function makeCode(length){
    var text="";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i=0; i<length;i++){
        text +=possible.charAt(Math.floor(Math.random()*possible.length));
    }
    return text;
}
function ajaxJoinRoom(){
    $.ajax({
      type : "POST",
      url : "/rooms/join",
      data : {
        code: $('#codeRoom').val()
      },
      success: function(result){
        //alert(result);
        //ajaxLoadRoom(result);
        //window.location.pathname = 
        window.location.replace(window.location.protocol + "//" + window.location.host + result);
      },
      error : function(e) {
        console.log("ERROR: ", e);
      }
    });  
  }
$(document).ready(function(){
   
    $('a').on('click',function(){
        //$('#newRoom').hide();
        //alert($(this).html());
        var object={
            currRoom: $('#currentRoom').html(),
            nextRoom: $(this).attr('id')
        };
        socket.emit("user-join-room",object);
    });
    $('#codeRoom').keyup(function(e){
        if(e.keyCode == 13)
        {
            //alert("AAA");
            ajaxJoinRoom();
        }
    });
    $('#inputSearch').keyup(function(){
        $('#search-room').html("");
        
        ajaxSearchRoom();
        
    });
    $('#notice').click(function(){
        $(".txtNotice").html("0")
        $('#div-notices').toggle(100);
        
    });
    $('input[name="use-random"]').click(function(){
        var $radio = $(this);

        // if this was previously checked
        if ($radio.data('waschecked') == true)
        {
            $radio.prop('checked', false);
            $radio.data('waschecked', false);
            $('#code').val("");
        }
        else{
            $radio.data('waschecked', true);
            var code=makeCode(10);
            $('#code').val(code);
        }
        
    })
});