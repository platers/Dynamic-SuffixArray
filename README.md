# Dynamic-SuffixArray
Simple Dynamic SuffixArray for databases

This data structure supports O(log n) exact substring search for databases. Records can be inserted and deleted in O(log n).
It uses around O(n) space to store a skip list.

Loosly based on https://elar.urfu.ru/bitstream/10995/3710/3/RuSSIR_2011_04.pdf

#TODO
Add more unit tests
Test performance on large database.
Remove unnecesary functions from skip list.
Package it.
