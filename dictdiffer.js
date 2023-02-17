/**
 * This function will take a patch (diffResult) object, as defined by the Python dictdiffer module:
 * 		https://dictdiffer.readthedocs.io/en/latest/
 * and will patch the destination JavaScript object. This is very useful when sending changes to objects shared between
 * Python code and JavaScript code, like through a websocket connection.
 *
 * @param {object} diffResult - the output from the Python function dictdiffer.diff()
 * @param {object} destination - the target JavaScript object. Note that prior to changes the dictionary on the Python
 * 															 side must match the JavaScript object. It is a one-way patch
 * 															 (Python dict -> JavaScript object).
 * @returns {object} - returns the patched object. While not strictly necessary because the destination object is
 * 										 directly updated, it's useful to return the object in some scenarios.
 */
export function patch(diffResult, destination) {
	function dotLookup(source, lookup, parent = false) {
		if (!lookup) {
			return source;
		}
		let value = source;
		let keys;
		if (Array.isArray(lookup)) {
			// the lookup is a list of keys
			keys = [...lookup];
		} else if (typeof lookup === 'string' || lookup instanceof String) {
			// the lookup is a string, split by "."
			keys = lookup.split('.');
		} else {
			throw new Error(
				'function dotLookup requires that the lookup parameter be either a string or an array'
			);
		}
		if (parent) {
			// Remove the last key
			keys.pop();
		}
		keys.forEach((key, index, array) => {
			if (Array.isArray(value)) {
				key = parseInt(key);
			}
			value = value[key];
		});
		return value;
	}

	function add(node, changes) {
		for (let idx = 0; idx < changes.length; idx++) {
			let key = changes[idx][0];
			let value = changes[idx][1];
			let dest = dotLookup(destination, node);
			if (Array.isArray(dest)) {
				dest.splice(key, 0, value);
			} else {
				dest[key] = value;
			}
		}
	}

	function change(node, changes) {
		let dest = dotLookup(destination, node, true);
		let lastNode;
		if (Array.isArray(node)) {
			lastNode = node.pop();
		} else {
			lastNode = node.split('.').pop();
		}
		if (Array.isArray(dest)) {
			lastNode = parseInt(lastNode);
		}
		dest[lastNode] = changes.pop();
	}

	function remove(node, changes) {
		for (let idx = 0; idx < changes.length; idx++) {
			let key = changes[idx][0];
			let dest = dotLookup(destination, node);
			if (Array.isArray(dest)) {
				dest.splice(key, 1);
			} else {
				delete dest[key];
			}
		}
	}

	for (let idx = 0; idx < diffResult.length; idx++) {
		let action = diffResult[idx][0];
		let node = diffResult[idx][1];
		let changes = diffResult[idx][2];
		if (action === 'add') {
			add(node, changes);
		}
		if (action === 'change') {
			change(node, changes);
		}
		if (action === 'remove') {
			remove(node, changes);
		}
	}

	return destination;
}

/**
 * This function will just run some tests against this library.
 */
function runTests() {
	let testObject1 = { a: { b: { c: 3, list: [1, 2] } }, y: [100, 200, 300], remove_this: 'blah' };
	let testObject2 = { a: { b: { c: 1, d: 2, list: [3, 4, 5] } }, z: 1000, y: [100, 200] };
	let diffList = [
		['change', ['a', 'b', 'list', 0], [1, 3]],
		['change', ['a', 'b', 'list', 1], [2, 4]],
		['change', 'a.b.c', [3, 1]],
		['add', 'a.b.list', [[2, 5]]],
		['add', 'a.b', [['d', 2]]],
		['remove', 'y', [[2, 300]]],
		['add', '', [['z', 1000]]],
		['remove', '', [['remove_this', 'blah']]]
	];

	console.log('testObject1: ' + JSON.stringify(testObject1));
	console.log('testObject2: ' + JSON.stringify(testObject2));
	console.log('diffList: ' + JSON.stringify(diffList));

	patch(diffList, testObject1);

	console.log('Patch complete');
	console.log('testObject1: ' + JSON.stringify(testObject1));
	console.log('testObject2: ' + JSON.stringify(testObject2));
}
