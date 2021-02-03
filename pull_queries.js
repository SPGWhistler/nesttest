const got = require('got');
const parser = require('fast-xml-parser');
//const Client = require("@replit/database");
//const client = new Client();
const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile;
const keyv = new Keyv({
  store: new KeyvFile({
    filename: `./titles.json`,
  }),
});

buildQueries = () => {
  let queries = [];
  loopChars((char) => {
    if (char !== ' ') {
      queries.push(char);
      loopChars((char2) => {
        queries.push(char + char2);
        loopChars((char3) => {
          queries.push(String(char + char2 + char3));
        });
      });
    }
  });
  return queries;
};
loopChars = (cb) => {
  for (let i = 32; i < 123; i++) {
    if (i === 32 || (i > 47 && i < 58) || (i > 96 && i < 123)) {
      cb(String.fromCharCode(i));
    }
  }
};

(async () => {
  const queries = buildQueries();
  let i = 0;
  let total = queries.length;
  for (const q of queries) {
    i++;
    let pct = ((i / total) * 100).toPrecision(4);
    try {
      console.log(`${q} (${i} of ${total} ~${pct}%)...`);
      if (!(await keyv.get(q))) {
        const resp = await got(
          `https://www.goodreads.com/search/index.xml?key=RDfV4oPehM6jNhxfNQzzQ&page=1&search=all&q=${q}`,
        );
        const jsonObj = parser.parse(resp.body, {});
        let titles;
        if (
          jsonObj &&
          jsonObj.GoodreadsResponse &&
          jsonObj.GoodreadsResponse.search &&
          jsonObj.GoodreadsResponse.search.results &&
          jsonObj.GoodreadsResponse.search.results.work
        ) {
          if (!Array.isArray(jsonObj.GoodreadsResponse.search.results.work)) {
            jsonObj.GoodreadsResponse.search.results.work = [
              jsonObj.GoodreadsResponse.search.results.work
            ];
          }
          titles = jsonObj.GoodreadsResponse.search.results.work.map(
            (result) => result.best_book.title,
          );
          console.log(`got ${titles.length} results`);
        } else {
          titles = [];
          console.log('no results');
        }
        titles = titles.slice(0, 5);
        await keyv.set(q, titles);
        //client.set('a', titles);
        console.log('saved');
      } else {
        console.log('cached');
      }
    } catch (err) {
      console.log('error: ', err);
    }
  }
})();
