'use strict';
(function () {
  var pageHeader = document.querySelector('.page-header');
  var headerMenuToggle = document.querySelector('.page-header__menu-toggle');
  var aboutUs = document.querySelector('.about-us');
  var textToCut = aboutUs.querySelector('.about-us__text');

  pageHeader.classList.remove('page-header--nojs');
  headerMenuToggle.classList.remove('page-header--nojs');

  var getContent = function (element) {
    return element.innerText || element.textContent;
  };

  getContent(textToCut);
})();
