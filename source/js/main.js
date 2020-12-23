'use strict';
(function () {
  var Settings = {
    ESC_KEY_CODE: 27
  };
  var INVALID_FIELD_BACKGROUND_COLOR = '#ff8282';
  var VALID_FIELD_BACKGROUND_COLOR = 'rgba(255,255,255, 0.1)';

  var body = document.querySelector('body');
  var pageHeader = document.querySelector('.page-header');
  var scrollDown = pageHeader.querySelector('.page-header__scroll-down');
  var promoButton = pageHeader.querySelector('.page-header__promo-button');
  var feedbackForm = document.querySelector('.form--wide');
  var phoneInputs = document.querySelectorAll('input[type="tel"');
  var formSubmitButton = feedbackForm.querySelector('button[type="submit"]');
  var requestCallButton = pageHeader.querySelector('.page-header__request-call');
  var popup = document.querySelector('.modal');
  var popupForm = popup.querySelector('.form--subtile');
  var popupFormSubmitButton = popup.querySelector('button[type="submit"]');
  var popupFocusField = popup.querySelector('input[name="call-me-name"]');
  var closeX = popup.querySelector('.modal__close');
  var pageFooter = document.querySelector('.page-footer');
  var accordionButtons = pageFooter.querySelectorAll('.page-footer__accordion-toggle');
  var accordionContainers = pageFooter.querySelectorAll('.page-footer__info-container');
  var customSubmitValidations = [];

  var isStorageSupport = true;
  var storage = '';

  try {
    storage = localStorage;
  } catch (err) {
    isStorageSupport = false;
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

  var openPopupHandler = function () {
    showPopup();
    popupFocusField.focus();
    window.addEventListener('keydown', escKeyHandler);
  };

  var showPopup = function () {
    var overlay = document.createElement('div');

    overlay.classList.add('overlay');
    overlay.addEventListener('click', closePopupHandler);

    body.classList.add('modal-open');

    if (popup) {
      popup.classList.add('modal--show');
      popupFocusField.focus();
    }

    body.appendChild(overlay);
  };

  var closePopup = function () {
    var overlay = document.querySelector('.overlay');

    if (overlay) {
      body.removeChild(overlay);
    }

    if (popup) {
      popup.classList.remove('modal--show');
      body.classList.remove('modal-open');
    }
  };

  var scrollSmoothly = function (element) {
    var anchor = element.getAttribute('href');
    window.vendorScripts.scroll(anchor, 700);
  };

  var indicateInvalidField = function (element, indicator) {
    element.style.backgroundColor = (indicator) ? INVALID_FIELD_BACKGROUND_COLOR : VALID_FIELD_BACKGROUND_COLOR;
  };

  var initRequired = function (form) {
    var inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(function (input) {
      if (storage) {
        input.value = storage[input.name] ? storage[input.name] : '';
      }

      if (input.hasAttribute('data-custom-required')) {
        input.removeAttribute('required');
      }
    });
  };

  var customRequired = function (element) {
    var validityMessage = '';

    if (element.hasAttribute('data-custom-required')) {
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
      window.vendorScripts.reportValidity(input);
    });

    return validity;
  };

  var customSubmitForm = function (form) {
    if (validateForm(form, customSubmitValidations)) {
      if (isStorageSupport) {
        var inputs = form.elements;

        for (var i = 0; i < inputs.length; i++) {
          if (inputs[i].nodeName === 'INPUT' || inputs[i].nodeName === 'TEXTAREA') {
            localStorage.setItem(inputs[i].name, inputs[i].value);
          }
        }
      }
      form.submit();
    }
  };

  phoneInputs.forEach(function (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var validityMessage = '';
      if (phoneInput.value) {
        validityMessage = (phoneInput.value.length < 14) ? 'Введите 10 цифр телефона' : '';
      }

      phoneInput.setCustomValidity(validityMessage);
      phoneInput.checkValidity();
      indicateInvalidField(phoneInput, validityMessage);
    });
  });

  accordionContainers.forEach(function (container) {
    container.classList.remove('page-footer__info-container--no-js');
  });

  customSubmitValidations.push(customRequired);
  initRequired(feedbackForm);
  initRequired(popupForm);

  formSubmitButton.addEventListener('click', function (evt) {
    evt.preventDefault();
    customSubmitForm(feedbackForm);
  });

  feedbackForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
    customSubmitForm(feedbackForm);
  });

  popupFormSubmitButton.addEventListener('click', function (evt) {
    evt.preventDefault();
    customSubmitForm(popupForm);
  });

  popupForm.addEventListener('submit', function (evt) {
    evt.preventDefault();
    customSubmitForm(popupForm);
  });

  if (popup) {
    closeX.addEventListener('click', closePopupHandler);
  }

  if (requestCallButton) {
    requestCallButton.addEventListener('click', function (evt) {
      evt.preventDefault();
      openPopupHandler();
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

  accordionButtons.forEach(function (button) {
    function checkDiv(element) {
      if (element.nextElementSibling && ((element.nextElementSibling.tagName === 'DIV') || (element.tagName === 'BODY'))) {
        return element.nextElementSibling;
      } else {
        return checkDiv(element.parentElement);
      }
    }

    button.addEventListener('click', function (evt) {
      evt.preventDefault();
      var accordion = checkDiv(evt.target);

      accordion.classList.add('page-footer__info-container--current');
      var openedAccordions = pageFooter.querySelectorAll('.page-footer__info-container--active:not(.page-footer__info-container--current)');

      openedAccordions.forEach(function (element) {
        element.classList.remove('page-footer__info-container--active');
        element.previousElementSibling.classList.remove('page-footer__accordion-toggle--active');
      });

      accordion.classList.remove('page-footer__info-container--current');
      button.classList.toggle('page-footer__accordion-toggle--active');
      accordion.classList.toggle('page-footer__info-container--active');
    });
  });
})();
