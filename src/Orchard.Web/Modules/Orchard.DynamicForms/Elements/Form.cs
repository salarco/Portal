using Orchard.Layouts.Elements;
using Orchard.Layouts.Helpers;

namespace Orchard.DynamicForms.Elements {
    public class Form : Container {
        public override string Category {
            get { return "Form"; }
        }

        public string Name {
            get { return Data.Get("FormName", "Untitled"); }
            set { Data["FormName"] = value; }
        }

        public bool? EnableClientValidation {
            get { return Data.Get("EnableClientValidation").ToBoolean(); }
            set { Data["EnableClientValidation"] = value.ToString(); }
        }

        public string Action {
            get { return Data.Get("FormAction"); }
            set { Data["FormAction"] = value; }
        }

        public string Method {
            get { return Data.Get("FormMethod"); }
            set { Data["FormMethod"] = value; }
        }

        public bool? StoreSubmission {
            get { return Data.Get("StoreSubmission").ToBoolean(); }
            set { Data["StoreSubmission"] = value != null ? value.Value.ToString() : null; }
        }

        public bool? CreateContent {
            get { return Data.Get("CreateContent").ToBoolean(); }
            set { Data["CreateContent"] = value != null ? value.Value.ToString() : null; }
        }

        public string ContentType {
            get { return Data.Get("CreateContentType"); }
            set { Data["CreateContentType"] = value; }
        }

        public string Publication {
            get { return Data.Get("Publication"); }
            set { Data["Publication"] = value; }
        }

        public string Notification {
            get { return Data.Get("Notification"); }
            set { Data["Notification"] = value; }
        }

        public string RedirectUrl {
            get { return Data.Get("RedirectUrl"); }
            set { Data["RedirectUrl"] = value; }
        }
    }
}