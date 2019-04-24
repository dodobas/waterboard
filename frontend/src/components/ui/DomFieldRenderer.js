import WbRenderTextInputField from "../templates/form.field.text-input";

/**
 * TODO a class might be an overkill
 * Helper class to render dom fields from json and append to parent
 * For every field definition will create a dom object (defaults to input field) and
 * append to parent
 *
 * Does not handle state
 *
 * renderFn (optional) - render function to be used to render field from field definition
 *
 * @constructor
 * @param {html} parent
 * @param {string} parentId
 * @param {array} fieldDefinitions
 */
export default class DomFieldRenderer {
    constructor(options) {

        const {
            parent,
            parentId = 'table-reports-filter-wrap',
            fieldDefinitions = []

        } = options;

        this.defaultRenderFn = WbRenderTextInputField;

        this.parent = parent || document.getElementById(parentId);

        this.fieldDefinitions = fieldDefinitions;

        this.renderFilterFields();
    }

    renderFilterFields = () => {
        let _domObj;
        this.fieldDefinitions.forEach((field) => {

            if (field.renderFn) {
                _domObj = field.renderFn(field);
            } else {
                _domObj = this.defaultRenderFn(field);
            }
            this.parent.appendChild(_domObj);
        });
    };

}
