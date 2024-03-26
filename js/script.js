$(document).ready(function () {
    let muted = true;
    var vimeoPlayer = new Vimeo.Player('background');

    $("#muted").on('mouseup', function () {
        if (muted == true) {
            $("#muted svg").removeClass("fa-volume-xmark").addClass("fa-volume-high");

            vimeoPlayer.setMuted(false)
            muted = false;
        } else {
            $("#muted svg").removeClass("fa-volume-high").addClass("fa-volume-xmark");

            vimeoPlayer.setMuted(true)
            muted = true;
        }
    });

    // Definindo o controle de volume inicial
    $("#background").prop("volume", 0.5); // 0.5 para 50%

    // Função para controlar o volume quando o range for alterado
    $("#volume_range").on('input', function () {
        var volume = $(this).val() / 100; // Convertendo para um valor entre 0 e 1
        vimeoPlayer.setVolume(volume)
    });

    var images = [
        "Luffy.webp",
        "g2_0.webp",
        "g2_1.webp",
        "g3_0.webp",
        "g3_1.webp",
        "g4_1.webp",
        "g5_1.webp",
        "Nightmare.webp",
        "Tankman.webp",
        "Snakeman.webp",
    ];

    var currentIndex = 0;
    var totalImages = images.length;

    // Função para mostrar a próxima imagem
    function showNextImage() {
        $('#carousel img').fadeOut(1000, function () {
            $(this).attr('src', './media/img/' + images[currentIndex]).fadeIn(1000);
        });
        currentIndex = (currentIndex + 1) % totalImages;
    }

    // Define o intervalo para trocar as imagens automaticamente
    var interval = setInterval(showNextImage, 3000); // Troca a cada 3 segundos






});