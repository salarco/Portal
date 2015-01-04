using Orchard.Layouts.Helpers;

namespace Orchard.DynamicForms.Elements {
    public class Taxonomy : LabeledFormElement {
        
        public string InputType {
            get { return Data.Get("InputType", "SelectList"); }
            set { Data["InputType"] = value; }
        }

        public int? TaxonomyId {
            get { return Data.Get("TaxonomyId").ToInt32(); }
            set { Data["TaxonomyId"] = value.ToString(); }
        }

        public string SortOrder {
            get { return Data.Get("SortOrder"); }
            set { Data["SortOrder"] = value; }
        }

        public string OptionLabel {
            get { return Data.Get("OptionLabel"); }
            set { Data["OptionLabel"] = value; }
        }

        public string TextExpression {
            get { return Data.Get("TextExpression"); }
            set { Data["TextExpression"] = value; }
        }

        public string ValueExpression {
            get { return Data.Get("ValueExpression"); }
            set { Data["ValueExpression"] = value; }
        }
    }
}