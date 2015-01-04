using System.Globalization;
using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;
using Orchard.Localization;

namespace Orchard.Layouts.Elements {
    public class Column : Container, IColumn {
        
        public override string Category {
            get { return "Layout"; }
        }

        public override LocalizedString DisplayText {
            get { return T("Column"); }
        }

        public override bool IsSystemElement {
            get { return true; }
        }

        public override bool HasEditor {
            get { return true; }
        }

        public int? Width {
            get { return  Data.Get("Width").ToInt32() ?? Data.Get("ColumnSpan").ToInt32() ?? 0; } // Falling back on "ColumnSpan" for backward compatibility.
            set { Data["Width"] = value != null ? value.Value.ToString(CultureInfo.InvariantCulture) : null; }
        }

        public int? Offset {
            get { return Data.Get("Offset").ToInt32() ?? Data.Get("ColumnOffset").ToInt32() ?? 0; } // Falling back on "ColumnOffset" for backward compatibility.
            set { Data["Offset"] = value != null ? value.Value.ToString(CultureInfo.InvariantCulture) : null; }
        }

        public int Size {
            get { return Width.GetValueOrDefault() + Offset.GetValueOrDefault(); }
        }
    }
}