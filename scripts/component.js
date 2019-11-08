var macroEntry = `
<button class="macro-list-entry text-button  {{border}}-border" data-target="{{id}}" 
onclick="macro(this)" data-categories="{{categories}}"> {{name}} </button>
`;

var globalMicroButton = `
<span data-templateID="{{templateID}}" data-tag="{{templateTags}}" class="micro-button-container">
    <button class="text-button macro-preset {{templateBorder}}-border" 
    data-templateID="{{templateID}}" onclick="addGlobalMicro('{{templateID}}')"
    data-tag="{{templateTags}}">{{templateName}}</button>
</span>
`;
var editMicroButton =
    `<div data-templateID="{{templateID}}" 
       class=" inline text-button little-icon-button" 
       onclick="editPersonalMicroTemplate('{{templateID}}')"> 
        <i class="material-icons"> edit </i> 
  </div>`;
var personalMicroButton = `
<span data-templateID="{{templateID}}" data-tag="{{templateTags}}" class="micro-button-container">
    <button style="margin-right: -35px;" class="text-button macro-preset {{templateBorder}}-border" data-templateID="{{templateID}}" onclick="addPersonalMicro('{{templateID}}')"
    data-tag="{{templateTags}}">{{templateName}} 
    </button>
    ${editMicroButton}
</span>
    `;

var deviceTemplate = `
    <div class="device-entry">
        <check-box data-target="{{deviceID}}"></check-box> <span>{{deviceName}}</span>
    </div>  
`;

var inputTemplate = `
<div class="form-area" style="margin-top: 15px;">
    <div class="text-label">{{purpose}}</div>
    <input autocomplete="new-password" autocapitalize="none" type="text"
    class="text-field text-field-sm micro-input" data-tag="{{tag}}"
    placeholder="" data-purpose="{{purpose}}" value="{{value}}" data-type="input"></input>
</div>`

var textareaTemplate = `
<div class="form-area" style="margin-top: 15px;">
    <div class="text-label">{{purpose}}</div>
    <textarea autocomplete="new-password" autocapitalize="none" type="text"
    class="text-field commit-message micro-input" data-tag="{{tag}}" data-type="textarea" 
    placeholder="" data-purpose="{{purpose}}">{{value}}</textarea>
</div>`

var fileInputTemplate = `
<div class="form-area" style="margin-top: 15px;">
    <div class="text-label">{{purpose}}</div>
    <div class="input-container">
        <button class="text-button browse-btn file-button electron-visible" onclick="showFileDialog(this)">
            Browse 
        </button>
        <input autocomplete="new-password" autocapitalize="none" type="text"
        class="text-field text-field-sm micro-input" data-tag="{{tag}}"
        placeholder="" data-purpose="{{purpose}}" value="{{value}}" data-type="input"></input>
    </div>
    
</div>
<script>
electronUI(isElectron)
</script>
`

var directoryInputTemplate = `
<div class="form-area" style="margin-top: 15px;">
    <div class="text-label">{{purpose}}</div>
    <div class="input-container">
        <button class="text-button browse-btn file-button electron-visible" onclick="showDirectoryDialog(this)">
            Browse 
        </button>
        <input autocomplete="new-password" autocapitalize="none" type="text"
        class="text-field text-field-sm micro-input" data-tag="{{tag}}"
        placeholder="" data-purpose="{{purpose}}" value="{{value}}" data-type="input"></input>
    </div>
</div>
<script>
electronUI(isElectron)
</script>
`

var microTemplate =
    `<div data-template={{id}} data-border="{{border}}" class="macro-list-item {{border}}-border" >
        <div>
            <div class="action-top">
                <button class=" handle text-button material-icons no-outline left-side"
                onclick="">reorder</button>
                <h3 class="title">{{title}}</h3>
                <button class="right-side text-button material-icons no-outline"
                onclick="$(this).parent().parent().parent().remove()">close</button>
            </div>
            <span style="display: none" class="command">{{command}}</span>
        </div>
    </div>`;

var templateInputFormTemplate = `
    <div class="edit-micro-input">
        <span class="material-icons handle"
            sßtyle="vertical-align: middle; margin-right: 5px; cursor: pointer;">reorder</span>
        <div class="form-area inline" style="margin-top: 15px">
            <div class="text-label">Type</div>
            <select  autocomplete="new-password" autocapitalize="none"
                type="text" class="text-button edit-template-input-type">
                <option value="input">Line</option>
                <option value="textarea">Area</option>
                <option value="file">File</option>
                <option value="dir">Folder</option>

            </select>
        </div>
       
        <div class="form-area inline" style="margin-top: 15px; width:20%">
            <div class="text-label">Variable</div>
            <input  autocomplete="new-password" autocapitalize="none"
                type="text" class=" edit-template-input-tag text-field text-field-sm">
        </div>
        <div class="form-area inline" style="margin-top: 15px; width: 30%">
            <div class="text-label">Purpose</div>
            <input  autocomplete="new-password" autocapitalize="none"
                type="text" class="text-field text-field-sm edit-template-input-purpose">
        </div>
        <span class="material-icons" style="vertical-align: middle; cursor: pointer;"
            onclick="$(this).parent().remove()">close</span>
    </div>
`;

var snackbarTemplate =
    `
<div class="snack-bar">
    <button class="text-button no-outline" onclick="{{actionfunc}}">{{action}}</button>
    | {{message}}
</div>
`;

var categoryTemplate = `<option value="{{category}}">{{category}}</option>`;



var checkbox =
    `
<div class="text-button toggle-button" onclick="this.setAttribute('data-checked', !(this.getAttribute('data-checked')=='true'))" data-checked="false"></div>

`
/* ************************ */

class Checkbox extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = checkbox + "";
    }
}
window.customElements.define('check-box', Checkbox);