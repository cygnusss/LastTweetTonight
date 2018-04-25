import React, { Component } from "react";
import axios from "axios";
import $ from "jquery";
import BigNumber from "bignumber.js";

import TweetsList from "../TweetList/TweetList.jsx";
import css from "./feed.css";

class Feed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tweets: [],
      max_id: undefined,
      loading: false, // Later I may Add a spinner using this
      position: "static",
    };

    this.getTweets = this.getTweets.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const position = nextProps.position;
    if (position !== this.state.position) {
      this.setState({ position })
    }
  }

  componentDidMount() {
    this.getTweets();
    // This will listen to the scroll event
    // If the top scroll + the size of the screen equals to the size
    // of the entire document (ie user reached the page's bottom) – load more tweets
    window.addEventListener("scroll", () => {
      if ($(window).scrollTop() + $(window).height() == $(document).height()){
        this.getTweets();
      }
    });
  }

  getTweets() {
    this.setState({ loading: true });
    axios("/tweets", { params: {max_id: this.state.max_id} })
      .then(({ data }) => {
        // Tweet_ids are really big numbers
        // so in order to avoid possible issues (duplicate tweets or loosing tweets)
        // I used the BigNumber module that lets you properly work with big numbers
          // Saving last tweet's id and substracting 1 from it allows to fetch
          // tweets with IDs less then that of the last fetched tweet
        const id_str = data[data.length - 1].id_str;
        const max_id = BigNumber(id_str).minus(1).toString(10);
        
        // Update state with new tweets and max_id
        const tweets = this.state.tweets.slice().concat(data)
        this.setState({ tweets, max_id, loading: false });
      });
  }

  render() {
    let style = { maxWidth: 490 };
    if (this.state.position === "fixed") {
      style.paddingTop = 60;
    }
    return (
      <div style={style}>
        <ul>
          <TweetsList tweets={this.state.tweets}/>
        </ul>
        {
          this.state.loading 
            ? <p>loading...</p>
            : ""
        }
      </div>
    );
  }
}

export default Feed;