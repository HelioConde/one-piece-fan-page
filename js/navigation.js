let page = "home";
function pageNavgation(page) {
    $("#view").hide();
    $.ajax({
        url: "view/" + page + ".html", success: function (result) {
            $("#view").html(result).fadeIn(2000);
        }
    });

}

pageNavgation(page)