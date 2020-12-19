'use strict';
(function () {
  var Settings = {
    ESC_KEY_CODE: 27
  };
  var INVALID_FIELD_BACKGROUND_COLOR = '#ff8282';
  var VALID_FIELD_BACKGROUND_COLOR = 'rgba(255,255,255, 0.1)';

  var pageHeader = document.querySelector('.page-header');
  var aboutUs = document.querySelector('.about-us');
  var textToCut = aboutUs.querySelector('.about-us__text');
  var scrollDown = pageHeader.querySelector('.page-header__scroll-down');
  var promoButton = pageHeader.querySelector('.page-header__promo-button');
  var feedbackForm = document.querySelector('.feedback-form');
  var phoneInput = feedbackForm.querySelector('input[type="tel"]');
  var formSubmitButton = feedbackForm.querySelector('button[type="submit"]');
  var customSubmitValidations = [];
  var requestCallFormTemplate = document.querySelector('#request-call')
      .content
      .querySelector('.request-call-form');
  var requestCallButton = pageHeader.querySelector('.page-header__request-call');
  var popupTemplate = document.querySelector('#popup')
      .content
      .querySelector('.modal');


  //полифил для forEach в IE11
  if (typeof window !== 'undefined' && window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }

  //полифил-заглушка для reportValidity в IE11
  if (!HTMLInputElement.prototype.reportValidity) {
    HTMLInputElement.prototype.reportValidity = function () {
      if (this.checkValidity()) {
        return true;
      } else {
        return false;
      }
    };
  }

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

  var scrollSmoothly = function (element) {
    var anchor = element.getAttribute('href');
    window.vendorScroll.do(anchor, 700);
  };

  var indicateInvalidField = function (element, indicator) {
    element.style.backgroundColor = (indicator) ? INVALID_FIELD_BACKGROUND_COLOR : VALID_FIELD_BACKGROUND_COLOR;
  };

  var initRequired = function (form) {
    var inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(function (input) {
      if (input.hasAttribute('custom-required')) {
        input.removeAttribute('required');
      }
    });
  };

  var customRequired = function (element) {
    var validityMessage = '';

    if (element.hasAttribute('custom-required')) {
      if (!element.value) {
        validityMessage += 'Это обязательное поле';
      }
    }

    element.setCustomValidity(validityMessage);

    indicateInvalidField(element, validityMessage);
  };

  var validateForm = function (form, validations) {
    var validity = 1;
    var inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(function (input) {
      for (var i = 0; i < validations.length; i++) {
        validations[i](input);
      }

      validity *= input.checkValidity();

      input.reportValidity();
    });

    return validity;
  };

  var customSubmitForm = function (form) {
    if (validateForm(form, customSubmitValidations)) {
      form.submit();
    }
  };

  customSubmitValidations.push(customRequired);
  initRequired(feedbackForm);

  formSubmitButton.addEventListener('click', function (evt) {
    evt.preventDefault();
    customSubmitForm(feedbackForm);
  });

  feedbackForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
    customSubmitForm(feedbackForm);
  });

  if (requestCallButton) {
    requestCallButton.addEventListener('click', function () {
      openPopupHandler(requestCallFormTemplate, 'modal--blue');
    });
  }

  if (scrollDown) {
    scrollDown.addEventListener('click', function (evt) {
      evt.preventDefault();
      scrollSmoothly(scrollDown);
    });
  }

  if (promoButton) {
    promoButton.addEventListener('click', function (evt) {
      evt.preventDefault();
      scrollSmoothly(promoButton);
    });
  }
})();
