using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;
using Orchard.ContentManagement;
using Orchard.Layouts.Framework.Elements;
using Orchard.Utility;

namespace Orchard.Layouts.Helpers {
    public static class ElementDataHelper {
        private static readonly string[] _elementDataBlackList = { "ElementData", "__RequestVerificationToken" };

        public static string Get(this ElementDataDictionary data, string key, string defaultValue = null) {
            return data != null ? data.ContainsKey(key) ? data[key] : defaultValue : defaultValue;
        }

        public static string Serialize(this ElementDataDictionary data) {
            return data == null ? "" : String.Join("&", data.Select(x => String.Format("{0}={1}", x.Key, HttpUtility.UrlEncode(x.Value))));
        }

        public static ElementDataDictionary Combine(this ElementDataDictionary target, ElementDataDictionary input, bool removeNonExistingItems = false) {
            var combined = new ElementDataDictionary(target);

            foreach (var item in input) {
                combined[item.Key] = item.Value;
            }

            if (removeNonExistingItems) {
                foreach (var item in target) {
                    if (!input.ContainsKey(item.Key)) {
                        combined.Remove(item.Key);
                    }
                }
            }
            return combined;
        }

        public static string Serialize(this NameValueCollection collection) {
            return collection.ToDictionary().Serialize();
        }

        public static ElementDataDictionary Deserialize(string data) {
            var dictionary = new ElementDataDictionary();
            if (String.IsNullOrWhiteSpace(data))
                return dictionary;

            var items = data.Split(new[] { '&' });

            foreach (var item in items) {
                var pair = item.Split(new[] { '=' });
                var key = pair[0];
                var value = HttpUtility.UrlDecode(pair[1]);

                if (!dictionary.ContainsKey(key) && !_elementDataBlackList.Contains(key))
                    dictionary.Add(key, value);
            }

            return dictionary;
        }

        public static ElementDataDictionary ToDictionary(this NameValueCollection nameValues) {
            var copy = new NameValueCollection(nameValues);

            foreach (var key in _elementDataBlackList) {
                copy.Remove(key);
            }

            var dictionary = new ElementDataDictionary();

            foreach (string key in copy) {
                dictionary[key] = String.Join(",", copy.GetValues(key).Select(HttpUtility.UrlEncode));
            }

            return dictionary;
        }

        public static IDictionary<string, object> ToTokenDictionary(this NameValueCollection nameValues) {
            var copy = new NameValueCollection(nameValues);

            foreach (var key in _elementDataBlackList) {
                copy.Remove(key);

            }

            var dictionary = new Dictionary<string, object>();

            foreach (string key in copy) {
                dictionary[key] = copy.GetValues(key);
            }

            return dictionary;
        }

        public static NameValueCollection ToNameValueCollection(this ElementDataDictionary dictionary) {
            var collection = new NameValueCollection();

            foreach (var entry in dictionary) {
                var values = entry.Value != null ? entry.Value.Split(new []{','}, StringSplitOptions.RemoveEmptyEntries) : new string[0];

                foreach (var value in values) {
                    collection.Add(entry.Key, HttpUtility.UrlDecode(value));
                }
            }

            return collection;
        }

        public static IValueProvider ToValueProvider(this ElementDataDictionary dictionary, CultureInfo culture) {
            return new NameValueCollectionValueProvider(dictionary.ToNameValueCollection(), culture);
        }

        public static TProperty Retrieve<TElement, TProperty>(this TElement element, Expression<Func<TElement, TProperty>> targetExpression, Func<TProperty> defaultValue = null) where TElement : IElement {
            var propertyInfo = ReflectionHelper<TElement>.GetPropertyInfo(targetExpression);
            var name = propertyInfo.Name;
            var data = element.Data;
            var value = data.Get(name, XmlHelper.ToString(defaultValue));

            return !String.IsNullOrWhiteSpace(value) ? XmlHelper.Parse<TProperty>(value) : defaultValue != null ? defaultValue() : default(TProperty);
        }

        public static TProperty Retrieve<TElement, TProperty>(this TElement element, Expression<Func<TElement, TProperty>> targetExpression, TProperty defaultValue = default(TProperty)) where TElement : IElement {
            return Retrieve(element, targetExpression, () => defaultValue);
        }

        public static TProperty Retrieve<TElement, TProperty>(this TElement element, Expression<Func<TElement, TProperty>> targetExpression) where TElement : IElement {
            return Retrieve(element, targetExpression, default(Func<TProperty>));
        }

        public static TProperty Retrieve<TProperty>(this IElement element, string name, Func<TProperty> defaultValue = null) {
            var data = element.Data;
            var value = data.Get(name);
            return !String.IsNullOrWhiteSpace(value) ? XmlHelper.Parse<TProperty>(value) : defaultValue != null ? defaultValue() : default(TProperty);
        }

        public static TProperty Retrieve<TProperty>(this IElement element, string name, TProperty defaultValue = default(TProperty)) {
            return Retrieve(element, name, () => defaultValue);
        }

        public static TProperty Retrieve<TProperty>(this IElement element, string name) {
            return Retrieve(element, name, default(Func<TProperty>));
        }

        public static void Store<TElement, TProperty>(this TElement element, Expression<Func<TElement, TProperty>> targetExpression, TProperty value) where TElement : IElement {
            var propertyInfo = ReflectionHelper<TElement>.GetPropertyInfo(targetExpression);
            var name = propertyInfo.Name;

            Store(element, name, value);
        }

        public static void Store<TProperty>(this IElement element, string name, TProperty value) {
            element.Data[name] = XmlHelper.ToString(value);
        }
    }
}