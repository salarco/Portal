using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;

namespace Orchard.Layouts.Elements {
    public class VectorImage : Element {
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

        public int? Width {
            get { return Data.Get("Width").ToInt32(); }
            set { Data["Width"] = value.ToString(); }
        }

        public int? Height {
            get { return Data.Get("Height").ToInt32(); }
            set { Data["Height"] = value.ToString(); }
        }
    }
}