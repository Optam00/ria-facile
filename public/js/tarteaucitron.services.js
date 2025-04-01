tarteaucitron.services.gtag = {
    "key": "gtag",
    "type": "analytic",
    "name": "Google Analytics",
    "uri": "https://policies.google.com/privacy",
    "needConsent": true,
    "cookies": ['_ga', '_gat', '_gid', '__utma', '__utmb', '__utmc', '__utmt', '__utmz'],
    "js": function () {
        window.dataLayer = window.dataLayer || [];
        tarteaucitron.addScript('https://www.googletagmanager.com/gtag/js?id=G-7QV1MCQ879', '', function () {
            window.gtag = function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7QV1MCQ879', { 'anonymize_ip': true });
        });
    }
};

// Configuration de Google Analytics
tarteaucitron.user.gtagId = 'G-7QV1MCQ879';
tarteaucitron.user.gtagMore = function () {
    // Cette fonction sera appelée quand gtag sera chargé
}; 