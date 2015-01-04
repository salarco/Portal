using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;

namespace Orchard.Layouts.Elements {
    public class Image : Element {
        public override string Category {
            get { return "Media"; }
        }

        public override bool HasEditor {
            get { return true; }
        }

        public int? MediaId {
            get { return Data.Get("MediaId").ToInt32(); }
            set { Data["MediaId"] = value.ToString(); }
        }
    }
}