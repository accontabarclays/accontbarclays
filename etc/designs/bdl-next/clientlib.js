(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  /**
   * Get element's position in document
   * @public
   * @param {Node} el
   */
  function getElementPosition(el) {
    if (!el) {
      return false;
    }

    var box = el.getBoundingClientRect();
    var _document = document,
        documentElement = _document.documentElement,
        body = _document.body;
    var scrollTop = window.pageYOffset || documentElement.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || documentElement.scrollLeft || body.scrollLeft;
    var clientTop = documentElement.clientTop || body.clientTop || 0;
    var clientLeft = documentElement.clientLeft || body.clientLeft || 0;
    return {
      top: Math.round(box.top + scrollTop - clientTop),
      left: Math.round(box.left + scrollLeft - clientLeft)
    };
  }
  /**
   * Return Array of Nodes
   * @public
   * @param {String} selector
   * @param {Node} el - Element to scope search to (defaults to document)
   * @returns {Array} elements
   */


  function getElements(selector) {
    var el = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
    return Array.prototype.slice.call(el.querySelectorAll(selector));
  }
  /**
   * Get viewport position
   * @public
   */


  function getViewportPosition() {
    var _document2 = document,
        documentElement = _document2.documentElement,
        body = _document2.body;
    return {
      top: window.pageYOffset || documentElement.scrollTop || body.scrollTop,
      left: window.pageXOffset || documentElement.scrollLeft || body.scrollLeft
    };
  }
  /**
   * accordion
   * @public
   * @return {String} accordion
   */
// Accordion Classes


  var CLS = {
    ITEM: 'Accordion-item',
    CONTENT: 'Accordion-content',
    TITLE_LINK: 'Accordion-titleLink',
    HASJS: 'has-js',
    EXPANDED: 'is-expanded',
    TRANSITIONING: 'is-transitioning'
  }; // Accordion Data Attributes

  var DATA = {
    EXPANDED: 'data-accordion-expanded',
    MULTIPLE: 'data-accordion-multiple',
    TRANSITION: 'data-accordion-transition'
  };

  var Accordion =
      /*#__PURE__*/
      function () {
        function Accordion(cfg) {
          var _this = this;

          _classCallCheck(this, Accordion);

          var el = cfg.el; // Add has-js class

          el.classList.add(CLS.HASJS); // Store containing element

          this._el = el; // Get array of all accordion items

          this._items = getElements(".".concat(CLS.ITEM), el); // Get array of all headings

          this._headings = getElements(".".concat(CLS.TITLE_LINK), el); // Get array of all content sections

          this._contentSections = getElements(".".concat(CLS.CONTENT), el); // Check if multiple data attribute is set

          this._allowMultiple = el.getAttribute(DATA.MULTIPLE) === 'true'; // If multiple items contain expanded attribute, assume multiple is allowed

          if (el.querySelectorAll("[".concat(DATA.EXPANDED, "=\"true\"]")).length > 1) {
            this._allowMultiple = true;
          } // Generate a lookup object array of tabs and their corresponding panels


          this._ids = this._generateTabPanelLookup(); // Add appropriate ARIA attributes to tabs and panels

          this._initAriaAttributes(); // Create a flag to indicate whether the accordion is currently animating


          this._isAnimating = false; // close all content sections

          this._closeAllContentSections(); // Open all sections with data attribute


          this._items.forEach(function (item, index) {
            if (item.getAttribute(DATA.EXPANDED) === 'true') {
              _this._openContentSection(index);
            } else {
              // Ensure false data attribute is present
              item.setAttribute(DATA.EXPANDED, false);
            }
          }); // Open specific section if anchor exists in URL


          this._openAnchor(); // Attach events


          this._attachKeyboardEvents();

          this._attachLinkEvents();

          this._attachTransitionEvents(); // Enable transitioning class to prevent double clicks (only if browser allows)
          // Done last so the initial close of content sections isn't transitioned


          this._useTransitioning = false;
          var element = document.createElement('element');

          if (element.style.transition !== undefined) {
            this.setUseTransitioning(true);

            this._attachTransitionEvents();
          } else {
            this._items.forEach(function (item) {
              item.classList.add('Accordion-item--no-transition');
            });
          } // Enable scroll to content section


          this._transitionViewport = el.getAttribute(DATA.TRANSITION) === 'true';
        }
        /**
         * Set in progress transitioning class can be used
         * @public
         * @param {Boolean} transitioning
         */


        _createClass(Accordion, [{
          key: "setUseTransitioning",
          value: function setUseTransitioning(transitioning) {
            this._useTransitioning = transitioning;
          }
          /**
           * Set whether multiple components can be opened at once
           * @public
           * @param {Boolean} multiple
           */

        }, {
          key: "setAllowMultiple",
          value: function setAllowMultiple(multiple) {
            this._allowMultiple = multiple;
          }
          /**
           * Open section in accordion by id
           * @public
           * @param {String} id
           */

        }, {
          key: "openSectionById",
          value: function openSectionById(id) {
            var _this2 = this;

            this._contentSections.forEach(function (section) {
              if (section.id === id) {
                var index = _this2._contentSections.indexOf(section);

                _this2._openContentSection(index);
              }
            });
          }
          /**
           * Set whether viewport should transition to content when opened
           * @public
           * @param {Boolean} enable
           * @note Does not work in IE
           */

        }, {
          key: "setTransitionViewport",
          value: function setTransitionViewport(enable) {
            this._transitionViewport = enable;
          }
          /**
           * Extract IDs from the href of each tab and use them to create
           * a lookup array correlating tabs with their panels
           * @private
           */

        }, {
          key: "_generateTabPanelLookup",
          value: function _generateTabPanelLookup() {
            var tabPanelLookup = [];

            this._headings.forEach(function (link) {
              var id = link.hash.replace('#', '');
              tabPanelLookup.push({
                tab: "".concat(id, "-tab"),
                panel: id
              });
            });

            return tabPanelLookup;
          }
          /**
           * Initialise ARIA attributes
           * @private
           */

        }, {
          key: "_initAriaAttributes",
          value: function _initAriaAttributes() {
            var _this3 = this;

            this._headings.forEach(function (link, index) {
              link.setAttribute('aria-selected', false);
              link.setAttribute('aria-expanded', false);
              link.setAttribute('id', _this3._ids[index].tab);
              link.setAttribute('aria-controls', _this3._ids[index].panel);
            });

            this._contentSections.forEach(function (content, index) {
              content.setAttribute('aria-hidden', true);
              content.setAttribute('id', _this3._ids[index].panel);
              content.setAttribute('aria-labelledby', _this3._ids[index].tab);
            });
          }
          /**
           * Attach keyboard events
           * @private
           */

        }, {
          key: "_attachKeyboardEvents",
          value: function _attachKeyboardEvents() {
            var _this4 = this;

            this._headings.forEach(function (link, index) {
              link.addEventListener('keydown', function (e) {
                if (/(40|39|38|37|36|35|32)/.test(e.keyCode)) {
                  e.preventDefault();
                }

                if (/(40|39)/.test(e.keyCode)) {
                  // Down/Right arrow
                  if (index < _this4._headings.length - 1) {
                    _this4._headings[index + 1].focus();
                  } else {
                    _this4._headings[0].focus();
                  }
                } else if (/(38|37)/.test(e.keyCode)) {
                  // Up/Left arrow
                  if (index === 0) {
                    _this4._headings[_this4._headings.length - 1].focus();
                  } else {
                    _this4._headings[index - 1].focus();
                  }
                } else if (e.keyCode === 36) {
                  // Home key
                  _this4._headings[0].focus();

                  _this4._openContentSection(0);
                } else if (e.keyCode === 35) {
                  // End key
                  _this4._headings[_this4._headings.length - 1].focus();

                  _this4._openContentSection(_this4._headings.length - 1);
                } else if (e.keyCode === 32) {
                  // Space key
                  if (link.getAttribute('aria-expanded') === 'true') {
                    _this4._closeContentSection(index);
                  } else {
                    _this4._openContentSection(index);
                  }
                }
              });
            });
          }
          /**
           * Attach click events to this._headings
           * @private
           */

        }, {
          key: "_attachLinkEvents",
          value: function _attachLinkEvents() {
            var _this5 = this;

            this._headings.forEach(function (link, index) {
              link.addEventListener('click', function (e) {
                e.preventDefault();

                if (link.getAttribute('aria-expanded') === 'true') {
                  _this5._closeContentSection(index);
                } else {
                  _this5._openContentSection(index);
                }
              });
            });
          }
          /**
           * Attach CSS Transition events to the content
           * @private
           */

        }, {
          key: "_attachTransitionEvents",
          value: function _attachTransitionEvents() {
            var _this6 = this;

            this._contentSections.forEach(function (content, index) {
              content.addEventListener('transitionend', function () {
                content.classList.remove(CLS.TRANSITIONING); // Reset height when transition has finished
                content.setAttribute("hidden", "");
                if (content.getAttribute('aria-hidden') === 'false') {
                  _this6._resetContentHeight(index);
                  content.removeAttribute("hidden");
                }
              });
            });
          }
          /**
           * Close all content sections
           * @private
           */

        }, {
          key: "_closeAllContentSections",
          value: function _closeAllContentSections() {
            var _this7 = this;

            // Close all content sections
            this._contentSections.forEach(function (section, index) {
              _this7._closeContentSection(index);
            });
          }
          /**
           * Close content section
           * @private
           * @param {Integer} index - Index of content section to close
           */

        }, {
          key: "_closeContentSection",
          value: function _closeContentSection(index) {
            var heading = this._headings[index];
            var content = this._contentSections[index];
            var item = this._items[index];
            var isTransitioning = content.classList.contains(CLS.TRANSITIONING);

            if (heading && content && item && !isTransitioning && item.classList.contains(CLS.EXPANDED)) {
              this._setContentHeight(index);

              if (this._useTransitioning) {
                // Start transition
                content.classList.add(CLS.TRANSITIONING);
              }

              setTimeout(function () {
                content.style.height = 0;
                item.classList.remove(CLS.EXPANDED);
              }, 25); // Update ARIA attributes

              heading.setAttribute('aria-selected', false);
              heading.setAttribute('aria-expanded', false);
              content.setAttribute('aria-hidden', true); // Update data attribute
              content.setAttribute("hidden", "");
              content.classList.remove(CLS.TRANSITIONING);
              item.setAttribute(DATA.EXPANDED, false); // Transition viewport if enabled

              if (this._transitionViewport) {
                this._transitionViewportToSection(index);
              }
            }
          }
          /**
           * Open content section
           * @private
           * @param {Integer} index - Index of content section to show
           */

        }, {
          key: "_openContentSection",
          value: function _openContentSection(index) {
            var heading = this._headings[index];
            var content = this._contentSections[index];
            var item = this._items[index];
            var isTransitioning = content.classList.contains(CLS.TRANSITIONING);

            content.setAttribute('aria-hidden', false); // Update data attribute to allow transition to work
            content.removeAttribute("hidden");
            if (heading && content && item && !isTransitioning) {
              // Close all if multiple aren't allowed
              if (!this._allowMultiple) {
                this._closeAllContentSections();
              }

              this._setContentHeight(index); // Update ARIA attributes


              heading.setAttribute('aria-selected', true);
              heading.setAttribute('aria-expanded', true);


              item.setAttribute(DATA.EXPANDED, true);

              if (this._useTransitioning) {
                // Start transition
                content.classList.add(CLS.TRANSITIONING);
              }

              item.classList.add(CLS.EXPANDED); // Transition viewport if enabled

              if (this._transitionViewport) {
                this._transitionViewportToSection(index);
              }
            }
          }
          /**
           * Set Content element height to child height
           * @private
           * @param {Number} index - Index of content section
           * @returns {Boolean} success
           */

        }, {
          key: "_setContentHeight",
          value: function _setContentHeight(index) {
            var content = this._contentSections[index];

            if (content && content.children) {
              // Sum the heights of the content's child nodes
              var height = [].slice.call(content.children).map(function (el) {
                return el.clientHeight;
              }).reduce(function (acc, clientHeight) {
                return acc + (clientHeight || 0);
              }, 0);
              content.style.height = "".concat(height, "px");
              return height > 0;
            }

            return false;
          }
          /**
           * Reset content height
           * @private
           * @param {Number} index - Index of content section
           */

        }, {
          key: "_resetContentHeight",
          value: function _resetContentHeight(index) {
            var content = this._contentSections[index];
            content.style.height = 'auto';
          }
          /**
           * Open specific section if anchor is present
           * @private
           * @returns {Boolean} success
           */

        }, {
          key: "_openAnchor",
          value: function _openAnchor() {
            // Strip out illegal chars from hash
            var id = window.location.hash.replace(/[^0-9a-z_-]/gi, ''); // Check if element with corresponding ID exists in the DOM

            var elementFound = id && this._el.querySelector("#".concat(id));

            if (elementFound) {
              this._openContentSection(this._contentSections.indexOf(elementFound), true);

              return true;
            }

            return false;
          }
          /**
           * Transition viewport to section
           * @private
           * @param {Integer} index - Index of content section to transition to
           */

        }, {
          key: "_transitionViewportToSection",
          value: function _transitionViewportToSection(index) {
            var _this8 = this;

            // Test if scroll method exists
            if (window.scrollBy) {
              // Stop any existing transitions
              clearInterval(this._transitionViewportInterval);
              var link = this._headings[index]; // Get destination

              var accordionPos = getElementPosition(this._el).top;
              var currentPos = getViewportPosition().top;
              var destination = accordionPos + link.clientHeight * index;
              var interval = 100 / 6; // 60fps

              var distance = Math.abs(destination - currentPos);
              var scrollStep = distance / (700 / interval);
              var down = destination > currentPos; // true = down, false = up
              // Start transition

              this._transitionViewportInterval = setInterval(function () {
                window.scrollBy(0, down ? scrollStep : -scrollStep); // test if we should stop scrolling

                var pos = getViewportPosition().top;

                if (pos === currentPos || down && pos > destination || !down && pos < destination) {
                  // Stop scroll
                  clearInterval(_this8._transitionViewportInterval);
                  window.scrollTo(0, destination);
                }

                currentPos = pos;
              }, interval);
            }
          }
        }]);

        return Accordion;
      }();

  document.addEventListener('DOMContentLoaded', function () {
    var accordions = [].slice.call(document.querySelectorAll('.Accordion'));
    accordions.forEach(function (el) {
      return new Accordion({
        el: el
      });
    });
  });

}());