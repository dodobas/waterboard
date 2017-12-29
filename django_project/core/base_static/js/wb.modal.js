// by knek for knek
var WB = WB || {};

/**
 * Simple module to control window overlay
 *
 * Can set inner html as dom object or string
 *
 * Can set overlay class - defaults to wb-overlay
 *
 * Can set overlay parent - defaults to document body
 *
 * On close removes overlay child from parent - doesen't kill the object
 *
 * Usage example - ajaxSpinner:
 *
 *      // create overlay instance
 *      WB.overlay = WB.ModalOverlay({});
 *
 *      // open overlay
 *      WB.overlay.open();
 *
 *      // set options (optional)
 *      WB.overlay.setOptions({
 *          parent: document.body,
 *          overlayClass: 'other-styling'
 *      });
 *
 *      // add some content (optional - can be empty)
 *      // returns the dom object so other listeners can be set - none planned for now
 *      var myOverlay = WB.overlay.content('<div class="spinner"></div>');
 *
 *      // close overlay
 *      WB.overlay.close();
 *
 *
 * @returns {
 *  {
 *      setOptions: _setOptions,
 *      open: _open,
 *      close: _close,
 *      content: _setInner
 *  }
 * }
 */

WB.ModalOverlay = function (options) {

    var _parent = false;

    var _overlay = document.createElement('div');

    _overlay.setAttribute('id', options.id || new Date().getTime());

    var _setOptions = function (opts) {
        _parent = opts.parent || document.body;
        _overlay.setAttribute('class', opts.overlayClass || 'wb-overlay');
    };

    _setOptions(options);

    var _close = function () {
        if(_parent.contains(_overlay)) {
           _parent.removeChild(_overlay);
        }
    };

    var _open = function () {
         _close();
        _parent.appendChild(_overlay);
    };

    var _setInner = function (domObj, emptyInner) {
        if(emptyInner === true) {
            while (_overlay.firstChild) {
                _overlay.removeChild(_overlay.firstChild);
            }
        }

        if (domObj instanceof HTMLElement) {
            _overlay.appendChild(domObj);
        } else if (domObj !== undefined && typeof domObj === 'string') {
            _overlay.innerHTML = domObj;
        } else {
            return false;
        }

        return _overlay;
    };

    return {
        setOptions: _setOptions,
        open: _open,
        close: _close,
        content: _setInner
    };
};



/**
 *
 * Basic idea is to have a modular modal wrapper.
 *
 * Modal markup is added to dom on .show({}) and removed on .hide()
 *
 * Inner content is set when opening modal - Modal.show({})
 *
 * On close remove inner content
 *
 * Close on Esc key down
 */
WB.Modal = function (options) {
    this.options = options;
    this._initialize();

    return this;
};

WB.Modal.prototype = {
    _initialize: function () {
        var self = this;

        this.overlay = false;
        this.modalWidth = null; //'400';

        // state
        this.open = false;

        // callbacks
        this.eventHooks = ['onClose', 'onCancel', 'beforeSubmit', 'onSave', 'onOpen'];

        this.onClose = null;
        this.onCancel = null;
        this.beforeSubmit = null;
        this.onSave = null;

        // CSS TRANSITION EVENT PREFIX
        this.transitionEvent = WB.utils.whichTransitionEvent();

        this.overlay = WB.ModalOverlay({});

        this._createModal();

        // keyCode is now in the process of being deprecated
        document.addEventListener('keydown', function (e) {
            e = e || window.event;

            var isEscape = false;

            if ('key' in e) {
                isEscape = e.key === 'Escape';
            } else {
                isEscape = e.keyCode === 27;
            }
            if (isEscape && self.open === true) {
                self.hide();
            }
        });

    },

    /**
     * Modal positioning - Currently implemented for middle and right position
     *  - might as well set styles here - if requested

     * Middle position is handled just by style 'display:table'
     * right position changes the css style.right property
     *
     * Modal will adjust to inner content dimensions if not specified otherwise
     *
     * Base behaviour is handled by css class .pos-middle, .pos-right
     *
     * @param options
     * @private
     */
    _setPosition: function () {
        // MIDDLE MODAL - centered vertically and horizontally
        if(this.options.position === 'middle') {

        } else if (this.options.position === 'right') {
            // if modal is used as sidebar show button bar - cancel
            this.btnGroup.style.display = 'flex';
            this.element.style.right = '0px';
        } else {
            // DEFINE SMTH FOR DEFAULT
            return false;
        }
    },

    // STARTING POSITION of modal
    _initPosition: function () {

        // MIDDLE MODAL - centered vertically and horizontally
        if(this.options.position === 'middle') {
            this.element.style.display = 'table';
        } else {
            // DEFINE SMTH FOR DEFAULT
            return false;
        }
    },
    /**
     * Set styles to modal
     *
     * stylesObj:
     * {
     *  css_style: value,
     *  width: '100%',
     *  height: '200px'
     * }
     * - TODO could extend to set per modal element
     */
    _setUserStyles: function (stylesObj) {
        var self = this;

        var styles = Object.keys(stylesObj);
        var i = 0;

        for (i; i < styles.length; i += 1) {

            self.content.style[styles[i]] = stylesObj[styles[i]];
        }

    },

    // SET STYLES
    _setStyles: function (options) {

        if (options.modalWidth || this.modalWidth) {
            this.element.style.width = (options.modalWidth || this.modalWidth + 'px');
        }

        if (options.modalHeight) {
            this.element.style.height = options.modalHeight;
        }

        this._setUserStyles(options.styles || {});
    },

    _setContent: function (domObj, newContent) {
        if(newContent instanceof jQuery) {
            $(domObj).html(newContent);
        } else if (newContent instanceof HTMLElement) {
            domObj.appendChild(
                newContent.cloneNode(true)
            );
        } else {
            domObj.innerHTML = newContent;
        }
    },


    /**
     * Create modal dom object
     * Set display to none
     *
     * Set properties
     * Set events:
     *  click - onCancel, onClose, saveBtn button
     *
     */
    _createModal: function () {
        var self = this;

        var dummy = document.createElement('div');

        var id = this.options.id || 'wb-' + new Date().getTime();

        dummy.innerHTML = '<div id="' + id + '" class="wb-modal pos-' + (this.options.position || 'right') + '">' +
                '<div class="close-button">' +
                      '<span class="fa-stack fa-lg">' +
                          '<i class="fa fa-stack-2x"></i>' +
                          '<i class="fa fa-times fa-stack-1x "></i>' +
                        '</span>' +
                '</div>' +
                '<div class="wb-modal-header wb-primary"></div>' +
                '<div class="content"></div>' +
                '<div class="modal-buttons">' +
                    '<button class="pure-button btn-primary saveBtn" style="margin-right: 5px">Save</button>' +
                    '<button class="pure-button cancelBtn">Close</button>' +
                '</div>' +
        '</div>';

        // element is the outer element - default is hidden <i class="fa fa-times" aria-hidden="true"></i>
        this.element = dummy.firstChild;

        this.element.style.display = 'none';

        this.title = this.element.querySelector('.wb-modal-header');
        this.content = this.element.querySelector('.content');
        this.btnGroup = this.element.querySelector('.modal-buttons');
        this.saveBtn = this.element.querySelector('.saveBtn');
        this.cancelBtn = this.element.querySelector('.cancelBtn');
        this.closeBtn = this.element.querySelector('.close-button');

        // EVENT LISTENERS

        var cancelFunc = function () {
            if (self.onCancel) {
                self.onCancel.call();
            }
            self.hide();
        };

        this.closeBtn.addEventListener('click', cancelFunc);

        this.cancelBtn.addEventListener('click', cancelFunc);

        this.saveBtn.addEventListener('click', function () {
            if (self.beforeSubmit !== false) {
                if (self._beforeSubmit() === false) return false;
            }

            if (self.onSave) {
                self.onSave.call(null, WB.utils.serializeForm(
                    self.element.querySelector('form'))
                );
            }
        });

        // listen for css transition end on element - used by sidebar on close
        // catches when modal is opened and closed
        this.transitionEvent && this.element.addEventListener( this.transitionEvent, function() {
            if(self.open === false) {
                 self._resetContent();
                 self.overlay.close();
            } else if (self.open === true) {
                if (self.options.onOpen && self.options.onOpen !== undefined) {
                    self.options.onOpen.call();
                }
            } else {
                console.log('Error. A unicorn cries somewhere.');
            }

        });
    },

    _handleHeader: function (title, headerClass) {
        var titleTag = 'h4';

        if (!title || title === '') {
            this.title.style.display = 'block';

            this.title.className = 'wb-modal-header ' + (headerClass || 'wb-primary');
            this.title.innerHTML = '<'+titleTag+'>' + title + '</' + titleTag + '>';
        } else {
            this.title.style.display = 'none';
        }
    },


   /*
    * @param required options.content (jQuery, HTML) = content to display
    * @param optional options.width (integer) = sidebar width
    * @param optional options.saveBtn (bool) = display save button
    * @param optional options.saveBtnLabel (bool) = save button label
    * @param optional options.onOpen (function) = hook when sidebar opens
    * @param optional options.onClose (function) = hook when sidebar closes
    * @param optional options.onCancel (function) = hook when sidebar is canceled
    * @param optional options.beforeSubmit (function) = hook to call before save
    * @param optional options.onSave (function(formData)) = hook when sidebar is saved
    * contentClass
    * title
    * modalWidth
    * modalHeight
    * position
    * headerClass -> any of lbl-warnign, lbl-danger .. btn-
    *
    * @returns {Node|*} - returns the modal dom object
    */
    show: function (options) {
        var self = this;

        // SHOW OVERLAY
        this.overlay.content(this.element);
        this.overlay.open();

        this.open = true;

        // CREATE
        this.element.classList.add('open');

        this.element.style.display = 'block';

        // Add additional class to content div
        if ( options.contentClass && options.contentClass !== '') {
            this.content.classList.add(options.contentClass);
        }

        // HANDLE TITLE / HEADER
        this._handleHeader(options.title, options.headerClass);

        // SET starting position - for animations and stuff (sidebar slide)
        this._initPosition();

        this._setStyles(options);


        // HACK - for triggering animation when creating and appending dom in single instance
        // modal animations will NOT BE TRIGGERED without this line
        // could also use setTimeout or access the offsetWidth Property of dom element
        this.element.getBoundingClientRect();

        // set button label, display
        if (options.onSave !== undefined) {
            this.saveBtn.innerHTML = options.saveBtnLabel === undefined ? 'Save' : options.saveBtnLabel;
            this.saveBtn.style.display = 'inline';
            this.btnGroup.style.display = 'flex';

        } else {
            this.saveBtn.style.display = 'none';
        }

        this.cancelBtn.innerHTML = options.cancelBtnLabel === undefined ? 'Close' : options.cancelBtnLabel;

        this._setContent(this.content, options.content);


        var hooks = options.eventHooks || this.eventHooks;
        var hooksCnt = hooks.length;

        var hook, i = 0;

        for (i; i < hooksCnt; i += 1) {
            hook = hooks[i];
            self[hook] = options[hook] === undefined ? false : options[hook];
        }


        // dont show button bar if no onSave and onCancel hooks are defined
        if(this.onSave === false && this.onCancel === false) {
            this.btnGroup.style.display = 'none';
        }

        // set desired modal position - triggers animation
        this._setPosition();

        return this.element;
    },

    /**
     * Set 'closed' position
     *  - example: when sidebar is open first transition its position to initial
     *
     * Remove open class from modal window
     * Close the overlay
     * Execute onClose method if is set
     */
    hide: function () {
        this.open = false;

        // HACK - for triggering animation when creating and appending dom in single instance
        // modal animations will NOT BE TRIGGERED without this line
        // could also use setTimeout or access the offsetWidth Property of dom element
        this.element.getBoundingClientRect();

        this._initPosition();

        if (this.onClose) {
            this.onClose.call();
        }
        this._resetContent();
        this.overlay.close();
    },

    /**
     * When closing the modal (onClose) remove all added content
     * Set modal styles
     * @private
     */
    _resetContent: function () {
        this.element.classList.remove('open');
        this.element.style.display = 'none';

        this._setUserStyles({
            height: 'auto',
            width: 'auto'
        });

        // Remove inner content
        while(this.content.firstChild) {
            this.content.removeChild(this.content.firstChild);
        }

        // Remove title
        while(this.title.firstChild) {
            this.title.removeChild(this.title.firstChild);
        }
    },

    _beforeSubmit: function () {}
};

