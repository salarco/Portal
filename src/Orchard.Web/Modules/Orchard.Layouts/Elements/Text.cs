using Orchard.Layouts.Framework.Elements;
using Orchard.Layouts.Helpers;

namespace Orchard.Layouts.Elements {
    public class Text : Element {
        public override string Category {
            get { return "Content"; }
        }
        
        public string Content {
            get { return this.Retrieve(x => x.Content); }
            set { this.Store(x => x.Content, value); }
        }
    }
}