using Orchard.DynamicForms.Validators.Settings;

namespace Orchard.DynamicForms.Elements {
    public class CheckBox : LabeledFormElement {
        public CheckBoxValidationSettings ValidationSettings {
            get { return Data.GetModel<CheckBoxValidationSettings>(""); }
        }
    }
}