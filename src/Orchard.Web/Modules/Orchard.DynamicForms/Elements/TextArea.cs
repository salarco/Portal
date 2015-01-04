using Orchard.DynamicForms.Validators.Settings;
using Orchard.Layouts.Helpers;

namespace Orchard.DynamicForms.Elements {
    public class TextArea : LabeledFormElement {
        public int? Rows {
            get { return Data.Get("Rows").ToInt32(); }
            set { Data["Rows"] = value.ToString(); }
        }

        public int? Columns {
            get { return Data.Get("Columns").ToInt32(); }
            set { Data["Columns"] = value.ToString(); }
        }

        public TextAreaValidationSettings ValidationSettings {
            get { return Data.GetModel<TextAreaValidationSettings>(""); }
        }
    }
}