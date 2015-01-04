using Orchard.Layouts.Helpers;

namespace Orchard.DynamicForms.Elements {
    public class Query : LabeledFormElement {
        
        public string InputType {
            get { return Data.Get("InputType", "SelectList"); }
            set { Data["InputType"] = value; }
        }

        public int? QueryId {
            get { return Data.Get("QueryId").ToInt32(); }
            set { Data["QueryId"] = value.ToString(); }
        }

        public string OptionLabel {
            get { return Data.Get("OptionLabel"); }
            set { Data["OptionLabel"] = value; }
        }

        public string TextExpression {
            get { return Data.Get("TextExpression", "{Content.Title}"); }
        }

        public string ValueExpression {
            get { return Data.Get("ValueExpression", "{Content.Id}"); }
        }
    }
}