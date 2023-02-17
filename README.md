# dictdiffer-js

A JavaScript partial port of the excellent [Python dictdiffer module](https://github.com/inveniosoftware/dictdiffer). We only had the need to support one-way updating (Python -> JavaScript) so we only implemented the `patch()` method. Feel free to issue PRs if you are interested in implementing any of the other methods from the Python module.

```javascript
/**
 * This function will take a patch (diffResult) object, as defined by the Python 
 * dictdiffer module:
 *    https://dictdiffer.readthedocs.io/en/latest/
 * and will patch the destination JavaScript object. This is very useful when sending 
 * changes to objects shared between Python code and JavaScript code, like through a 
 * websocket connection.
 *
 * @param {object} diffResult - the output from the Python function dictdiffer.diff()
 * @param {object} destination - the target JavaScript object. Note that prior to changes 
 *                               the dictionary on the Python side must match the JavaScript 
 *                               object. It is a one-way patch
 *                                   (Python dict -> JavaScript object).
 * @returns {object} - returns the patched object. While not strictly necessary because the 
 *                     destination object is directly updated, it's useful to return the 
 *                     object in some scenarios.
 */
```

