import SkipList from './index'

var
	assert = require('assert'),
	crypto = require('crypto')
	;

function makeAnimalList()
{
	var list = new SkipList();
	list.insert('cat', 'Cats are cute.');
	list.insert('dog', 'Dogs are loyal.');
	list.insert('aardvark', 'Aardvarks are long-nosed.');
	list.insert('wallaby', 'Wallabies bounce.');
	list.insert('caracal', 'Caracals are pretty.');
	list.insert('leopard', 'Leopards are spotted.');
	list.insert('pangolin', 'Pangolins trundle.');
	list.insert('ayeaye', 'Ayeaye are weird drinkers.');

	return list;
}

describe('SkipList', function()
{
	describe('#insert()', function()
	{
		it('adds an item to the skiplist', function()
		{
			var list = new SkipList<string>();
            assert.equal(list.length(), 0);
			list.insert('key', 'value');
            assert.equal(list.length(), 1);

			var result = list.search('key');
            assert.equal(result, 'value');
		});
	});
});