$(document).ready(function() {

    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
  
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
  
    });

    var file = document.getElementById("file");
        file.onchange = function(){
            if(file.files.length > 0) {
                document.getElementById('filename').innerHTML = file.files[0].name; 
            }
        };

 });

