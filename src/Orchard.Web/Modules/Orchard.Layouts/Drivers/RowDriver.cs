using System.Linq;
using Orchard.Layouts.Elements;
using Orchard.Layouts.Framework.Display;
using Orchard.Layouts.Framework.Drivers;
using Orchard.Layouts.Helpers;
using Orchard.Layouts.Services;

namespace Orchard.Layouts.Drivers {
    public class RowDriver : ElementDriver<Row> {
        private readonly IElementManager _elementManager;

        public RowDriver(IElementManager elementManager) {
            _elementManager = elementManager;
        }

        protected override void OnDisplaying(Row element, ElementDisplayContext context) {
            EnsureDefaultColumn(element, context);
            EnsureSpanValues(element);
            HandleColumnResizeEvent(element, context);
        }

        private void EnsureDefaultColumn(Row element, ElementDisplayContext context) {
            if (!element.Columns.Any()) {
                // Add a default column.
                var column = _elementManager.ActivateElement<Column>();
                column.Width = Grid.GridSize;
                element.Elements.Add(column);
            }
        }

        private static void EnsureSpanValues(Row element) {
            // Process each column, setting a span value if none is set.
            foreach (var column in element.Columns) {
                var span = column.Width;

                if (span == null) {
                    // Get the last column.
                    var lastColumn = element.Columns.LastOrDefault(x => x != column);
                    var lastColumnSpan = lastColumn != null ? lastColumn.Width ?? Grid.GridSize : Grid.GridSize;

                    if (lastColumn != null) {
                        lastColumn.Width = lastColumnSpan / 2;
                        column.Width = lastColumnSpan / 2;
                    }
                }
            }
        }

        private void HandleColumnResizeEvent(Row element, ElementDisplayContext context) {
            if (context.RenderEventName != "span-changed")
                return;

            var columnIndex = context.RenderEventArgs.ToInt32().GetValueOrDefault();
            var column = element.Columns.ElementAtOrDefault(columnIndex);

            if (column == null)
                return;

            var siblingIndex = columnIndex + 1;
            var sibling = element.Columns.ElementAtOrDefault(siblingIndex);

            if (sibling == null)
                return;

            var totalSpanSize = element.Size;

            if (totalSpanSize > Grid.GridSize) {
                // Decrease the sibling's span.
                var overflow = totalSpanSize - Grid.GridSize;
                var allowedSiblingShrink = sibling.Width - overflow >= 1 ? overflow : sibling.Width > 1 ? sibling.Width - 1 : 0;
                var selfShrink = sibling.Width - overflow <= 0 ? overflow - sibling.Width : 0;

                sibling.Width -= allowedSiblingShrink;
                column.Width -= selfShrink;
            }
            else {
                // Increase the sibling's span
                var space = Grid.GridSize - totalSpanSize;
                sibling.Width += space;
            }
        }
    }
}