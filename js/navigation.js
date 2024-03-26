function pageNavgation(page) {

    localStorage.setItem('page', page);

    $("#view").hide();
    $.ajax({
        url: "view/" + page + ".html", success: function (result) {
            $("#view").html(result).fadeIn(2000);
        }
    });


}

$(document).ready(function () {
    if (localStorage.getItem('page') == null) {
        localStorage.setItem('page', 'home');
        pageNavgation("home")
    } else {
        pageNavgation(localStorage.getItem('page'));
    }

    let mobileBar = false;
    $("#mobile").on('mouseup', function () {
        if (mobileBar == false) {
            $("#nav, #rede").css({
                'display': 'none',
                'opacity': 0 // Definir a opacidade inicial como 0 para usar fadeIn posteriormente
            }).animate({
                'opacity': 1 // Anima a opacidade de 0 para 1
            }, 1000).css({
                'display': 'flex' // Após a animação, altera o display para flex
            });


            $("nav").animate({
                height: '465px' // Altura desejada, por exemplo
            }, 1000); // Duração da animação em milissegundos (por exemplo, 1000ms para 1 segundo)


            mobileBar = true;
        } else {
            // Oculta os elementos #nav e #rede
            $("#nav, #rede").animate({
                opacity: 0 // Anima a opacidade para 0
            }, 500, function () {
                // Ao concluir a animação de opacidade
                $(this).css('display', 'none'); // Define o display como none
            });

            // Modifica a altura da navegação (nav) para 85px
            $("nav").animate({
                height: '85px'
            }, 500); // Duração da animação de 500ms


            mobileBar = false;
        }
    })

    $(window).on('resize', function () {
        toggleNavigation();
    });

    function toggleNavigation() {
        if ($(window).width() <= 767) {
            $("nav").css({
                'height': 'auto'
            })

        } else {
            // Caso a tela seja maior que 767px, garantimos que o menu seja visível
            $("#nav, #rede").css({
                'display': 'flex',
                'opacity': '1'
            });
            mobileBar = true;
        }
    }
});