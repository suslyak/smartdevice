'use strict';
(function () {
  var Settings = {
    ESC_KEY_CODE: 27
  };

  var pageHeader = document.querySelector('.page-header');
  var aboutUs = document.querySelector('.about-us');
  var textToCut = aboutUs.querySelector('.about-us__text');
  var requestCallFormTemplate = document.querySelector('#request-call')
      .content
      .querySelector('.request-call-form');

  var requestCallButton = pageHeader.querySelector('.page-header__request-call');

  var popupTemplate = document.querySelector('#popup')
      .content
      .querySelector('.modal');

  var keyHandler = function (event, key, action) {
    if (event.keyCode === key) {
      action();
    }
  };

  var escKeyHandler = function (event) {
    keyHandler(event, Settings.ESC_KEY_CODE, closePopupHandler);
  };

  var closePopupHandler = function () {
    closePopup();
    window.removeEventListener('keydown', escKeyHandler);
  };

  var openPopupHandler = function (template, mod) {
    showPopup(template, mod);
    window.addEventListener('keydown', escKeyHandler);
  };

  var getContent = function (element) {
    return element.innerText || element.textContent;
  };

  var showPopup = function (template, mod) {
    var overlay = document.createElement('div');

    overlay.classList.add('overlay');

    document.querySelector('body').appendChild(createPopup(template, mod));
    document.querySelector('body').classList.add('modal-open');
    document.querySelector('body').appendChild(overlay);
  };

  var closePopup = function () {
    var popup = document.querySelector('.modal');
    var overlay = document.querySelector('.overlay');

    if (overlay) {
      overlay.remove();
    }

    if (popup) {
      popup.remove();
      document.querySelector('body').classList.remove('modal-open');
    }
  };

  var createPopup = function (template, mod) {
    var content = template.cloneNode(true);
    var popup = popupTemplate.cloneNode(true);
    var closeX = popup.querySelector('.modal__close');

    popup.classList.add(mod);
    popup.appendChild(content);

    closeX.addEventListener('click', closePopupHandler);

    return popup;
  };

  if (requestCallButton) {
    requestCallButton.addEventListener('click', function () {
      openPopupHandler(requestCallFormTemplate, 'modal--blue');
    });
  }

  getContent(textToCut);
})();
