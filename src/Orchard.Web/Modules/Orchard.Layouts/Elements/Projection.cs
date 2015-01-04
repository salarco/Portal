using System;
using System.Globalization;
using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;

namespace Orchard.Layouts.Elements {
    public class Projection : Element {

        public override bool HasEditor {
            get { return true; }
        }

        public override string Category {
            get { return "Content"; }
        }

        public string QueryLayoutId {
            get { return Data.Get("QueryLayoutId"); }
            set { Data["QueryLayoutId"] = value; }
        }

        public int? QueryId {
            get {
                return String.IsNullOrWhiteSpace(QueryLayoutId) ? null : QueryLayoutId.Split(new[] { ';' })[0].ToInt32();
            }
        }

        public int? LayoutId {
            get {
                return String.IsNullOrWhiteSpace(QueryLayoutId) ? null : QueryLayoutId.Split(new[] { ';' })[1].ToInt32();
            }
        }

        public int ItemsToDisplay {
            get { return Data.Get("ItemsToDisplay").ToInt32().GetValueOrDefault(); }
            set { Data["ItemsToDisplay"] = value.ToString(CultureInfo.InvariantCulture); }
        }

        public int Skip {
            get { return Data.Get("Skip").ToInt32().GetValueOrDefault(); }
            set { Data["Skip"] = value.ToString(CultureInfo.InvariantCulture); }
        }

        public int MaxItems {
            get { return Data.Get("MaxItems").ToInt32().GetValueOrDefault(); }
            set { Data["MaxItems"] = value.ToString(CultureInfo.InvariantCulture); }
        }

        public string PagerSuffix {
            get { return Data.Get("PagerSuffix"); }
            set { Data["PagerSuffix"] = value; }
        }

        public bool DisplayPager {
            get { return Data.Get("DisplayPager").ToBoolean().GetValueOrDefault(); }
            set { Data["DisplayPager"] = value.ToString(CultureInfo.InvariantCulture); }
        }
    }
}