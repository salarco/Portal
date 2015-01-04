namespace Orchard.Layouts.Framework.Elements {
    public interface IColumn : IContainer {
        int? Width { get; set; }
        int? Offset { get; set; }
    }
}